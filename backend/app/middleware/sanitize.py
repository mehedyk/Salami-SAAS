"""
sanitize.py — Input sanitization for MongoDB injection and XSS.

MongoDB injection works by passing operator keys like $where, $gt, $ne
inside JSON bodies. We strip any key that starts with $ from nested dicts.
String values are stripped of HTML via bleach.
"""
import re
from typing import Any

import bleach

# ─── MongoDB operator injection prevention ───────────────────────────────────

_MONGO_OP_RE = re.compile(r'^\$')

def strip_mongo_operators(value: Any) -> Any:
    """
    Recursively remove any dict key starting with '$'.
    Raises ValueError if a suspicious operator is found so the route
    can return a 400 instead of silently dropping the field.
    """
    if isinstance(value, dict):
        clean = {}
        for k, v in value.items():
            if _MONGO_OP_RE.match(str(k)):
                raise ValueError(f"Forbidden key in input: {k!r}")
            clean[k] = strip_mongo_operators(v)
        return clean

    if isinstance(value, list):
        return [strip_mongo_operators(item) for item in value]

    return value


# ─── XSS sanitization ────────────────────────────────────────────────────────

# bleach strips all tags and attributes not in the allowlists.
_ALLOWED_TAGS:  list[str] = []        # no HTML tags for plain fields
_ALLOWED_ATTRS: dict      = {}

_RICH_ALLOWED_TAGS  = ["b", "i", "em", "strong", "br"]
_RICH_ALLOWED_ATTRS: dict = {}


def sanitize_str(value: str, allow_rich: bool = False) -> str:
    """Strip HTML from a string. allow_rich lets through safe inline tags."""
    tags  = _RICH_ALLOWED_TAGS  if allow_rich else _ALLOWED_TAGS
    attrs = _RICH_ALLOWED_ATTRS if allow_rich else _ALLOWED_ATTRS
    return bleach.clean(value, tags=tags, attributes=attrs, strip=True).strip()


def sanitize_body(data: Any, rich_fields: set[str] | None = None) -> Any:
    """
    Full sanitization pass over a parsed JSON body:
      1. Strip MongoDB operators
      2. HTML-clean all string values
    rich_fields: set of field names that may contain safe inline HTML.
    """
    rich_fields = rich_fields or set()

    # Step 1: MongoDB injection
    try:
        data = strip_mongo_operators(data)
    except ValueError as e:
        raise ValueError(str(e))

    # Step 2: XSS clean
    def _clean(value: Any, key: str = "") -> Any:
        if isinstance(value, str):
            return sanitize_str(value, allow_rich=(key in rich_fields))
        if isinstance(value, dict):
            return {k: _clean(v, k) for k, v in value.items()}
        if isinstance(value, list):
            return [_clean(item, key) for item in value]
        return value

    return _clean(data)


# ─── Flask request decorator ─────────────────────────────────────────────────

from functools import wraps
from flask import request
from ..utils.response import error_response


def sanitize_json(rich_fields: set[str] | None = None):
    """
    Decorator: sanitize request.json before the route runs.
    Stores cleaned body in flask.request._sanitized_body.
    Usage:
        @sanitize_json()
        def my_route():
            body = get_clean_body()
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return error_response("Content-Type must be application/json", 415)
            try:
                raw  = request.get_json(force=True, silent=True) or {}
                clean = sanitize_body(raw, rich_fields)
                request._sanitized_body = clean  # type: ignore[attr-defined]
            except ValueError as e:
                return error_response(str(e), 400)
            return f(*args, **kwargs)
        return wrapper
    return decorator


def get_clean_body() -> dict:
    """Retrieve the sanitized body set by @sanitize_json."""
    return getattr(request, "_sanitized_body", {})
