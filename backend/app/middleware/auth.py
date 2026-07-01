"""
auth.py — Clerk JWT verification middleware.

Clerk issues RS256 JWTs. We fetch the JWKS from Clerk's server,
find the matching key by kid, and verify the signature.
The decoded payload is stored in flask.g.user for the route to use.
"""
import json
from functools import wraps

import jwt
import requests
from flask import request, g, current_app

from ..utils.response import error_response

# Simple in-memory JWKS cache (refreshed on key mismatch)
_jwks_cache: dict = {}


def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    try:
        resp = requests.get(
            current_app.config["CLERK_JWKS_URL"],
            timeout=5,
        )
        resp.raise_for_status()
        _jwks_cache = resp.json()
        return _jwks_cache
    except Exception as e:
        current_app.logger.error("JWKS fetch failed: %s", e)
        return {}


def _get_public_key(kid: str):
    from jwt.algorithms import RSAAlgorithm

    jwks = _get_jwks()
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return RSAAlgorithm.from_jwk(json.dumps(key))

    # Kid not found — flush cache and retry once
    global _jwks_cache
    _jwks_cache = {}
    jwks = _get_jwks()
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return RSAAlgorithm.from_jwk(json.dumps(key))

    return None


def require_auth(f):
    """Decorator: verifies Clerk JWT, populates g.user = {clerk_id, email}."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return error_response("Missing or malformed Authorization header", 401)

        token = auth_header[7:]

        try:
            # Decode header only to get kid — no verification yet
            unverified_header = jwt.get_unverified_header(token)
        except jwt.DecodeError:
            return error_response("Invalid token format", 401)

        kid = unverified_header.get("kid")
        if not kid:
            return error_response("Token missing kid", 401)

        public_key = _get_public_key(kid)
        if public_key is None:
            return error_response("Could not resolve signing key", 401)

        try:
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                options={"require": ["sub", "exp"]},
            )
        except jwt.ExpiredSignatureError:
            return error_response("Token expired", 401)
        except jwt.InvalidTokenError as e:
            current_app.logger.warning("JWT invalid: %s", e)
            return error_response("Invalid token", 401)

        # Attach to request context
        g.user = {
            "clerk_id": payload["sub"],
            "email":    payload.get("email", ""),
        }

        return f(*args, **kwargs)

    return decorated


def optional_auth(f):
    """Like require_auth but sets g.user = None if no valid token."""

    @wraps(f)
    def decorated(*args, **kwargs):
        g.user = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            try:
                unverified_header = jwt.get_unverified_header(token)
                kid = unverified_header.get("kid")
                if kid:
                    public_key = _get_public_key(kid)
                    if public_key:
                        payload = jwt.decode(
                            token,
                            public_key,
                            algorithms=["RS256"],
                            options={"require": ["sub", "exp"]},
                        )
                        g.user = {
                            "clerk_id": payload["sub"],
                            "email":    payload.get("email", ""),
                        }
            except Exception:
                pass  # Silently ignore on optional auth
        return f(*args, **kwargs)

    return decorated
