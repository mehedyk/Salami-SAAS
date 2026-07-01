"""
users.py — User profile routes.

POST   /api/users/sync              Sync Clerk user → MongoDB (call after sign-in)
GET    /api/users/me                Get current user
PATCH  /api/users/me                Update display name + username
POST   /api/users/me/avatar         Upload avatar image
GET    /api/users/check/:username   Check username availability
"""
from flask import Blueprint, g, request

from ..middleware.auth     import require_auth
from ..middleware.sanitize import sanitize_json, get_clean_body
from ..middleware.schemas  import ProfileSchema
from ..middleware.mime     import require_image
from ..models              import user as UserModel
from ..utils.response      import success_response, error_response, created_response
from ..utils.cloudinary_helper import upload_image, delete_image
from ..utils.security      import parse_pagination
from marshmallow import ValidationError

users_bp = Blueprint("users", __name__)


# ── POST /api/users/sync ──────────────────────────────────────────────────────
@users_bp.post("/sync")
@require_auth
def sync_user():
    """
    Called from the frontend TokenSync component right after Clerk sign-in.
    Creates user document on first call; updates email/avatar on subsequent calls.
    Clerk sends display name + avatar via the JWT claims.
    """
    body = request.get_json(silent=True) or {}
    doc  = UserModel.upsert_from_clerk(
        clerk_id    = g.user["clerk_id"],
        email       = g.user["email"],
        display_name= body.get("display_name", ""),
        avatar_url  = body.get("avatar_url", ""),
    )
    return success_response(doc)


# ── GET /api/users/me ─────────────────────────────────────────────────────────
@users_bp.get("/me")
@require_auth
def get_me():
    user = UserModel.find_by_clerk_id(g.user["clerk_id"])
    if not user:
        return error_response("User not found. Call /sync first.", 404)
    return success_response(user)


# ── PATCH /api/users/me ───────────────────────────────────────────────────────
@users_bp.patch("/me")
@require_auth
@sanitize_json()
def update_me():
    body = get_clean_body()

    try:
        data = ProfileSchema().load(body)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    ok, msg = UserModel.update_profile(
        clerk_id     = g.user["clerk_id"],
        display_name = data["display_name"],
        username     = data["username"],
    )
    if not ok:
        return error_response(msg, 409)

    user = UserModel.find_by_clerk_id(g.user["clerk_id"])
    return success_response(user)


# ── POST /api/users/me/avatar ─────────────────────────────────────────────────
@users_bp.post("/me/avatar")
@require_auth
@require_image("avatar", "avatar")
def upload_avatar(validated_file):
    user = UserModel.find_by_clerk_id(g.user["clerk_id"])
    if not user:
        return error_response("User not found", 404)

    # Delete old Cloudinary asset if exists
    old_id = user.get("avatar_cloudinary_id")
    if old_id:
        delete_image(old_id)

    try:
        result = upload_image(validated_file, "avatar", public_id_prefix=g.user["clerk_id"])
    except RuntimeError as e:
        return error_response(str(e), 500)

    UserModel.update_avatar(g.user["clerk_id"], result["url"], result["public_id"])
    return success_response({"avatar_url": result["url"]})


# ── GET /api/users/check/<username> ──────────────────────────────────────────
@users_bp.get("/check/<username>")
def check_username(username: str):
    import re
    if not re.match(r'^[a-z0-9_-]{3,30}$', username.lower()):
        return error_response("Invalid username format", 400)

    taken = UserModel.username_taken(username)
    return success_response({"username": username.lower(), "available": not taken})
