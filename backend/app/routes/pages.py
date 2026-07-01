"""
pages.py — Salami page routes.

POST   /api/pages                   Create a new page
GET    /api/pages/mine              Get current user's page
PATCH  /api/pages/<id>              Update page fields
DELETE /api/pages/<id>              Delete page + all ledger entries
POST   /api/pages/<id>/publish      Publish page
POST   /api/pages/<id>/unpublish    Unpublish page
POST   /api/pages/<id>/avatar       Upload page avatar
POST   /api/pages/<id>/cover        Upload page cover image
GET    /api/pages/public/<username> Public page data (no auth)
"""
from flask import Blueprint, g, request

from ..middleware.auth     import require_auth, optional_auth
from ..middleware.sanitize import sanitize_json, get_clean_body
from ..middleware.schemas  import PageSchema
from ..middleware.mime     import require_image
from ..models              import salami_page as PageModel
from ..models              import ledger_entry as LedgerModel
from ..models              import user as UserModel
from ..utils.response      import success_response, error_response, created_response
from ..utils.cloudinary_helper import upload_image, delete_image
from marshmallow           import ValidationError

pages_bp = Blueprint("pages", __name__)


# ── POST /api/pages ───────────────────────────────────────────────────────────
@pages_bp.post("/")
@require_auth
@sanitize_json()
def create_page():
    # One page per user
    if PageModel.user_has_page(g.user["clerk_id"]):
        return error_response("You already have a salami page. Edit it instead.", 409)

    body = get_clean_body()
    try:
        data = PageSchema().load(body)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    # Premium theme gate
    if data["theme"] not in PageModel.FREE_THEMES:
        tier = UserModel.get_subscription_tier(g.user["clerk_id"])
        if tier == "free":
            return error_response("This theme requires a subscription.", 403)

    # Username: default to user's account username if not provided separately
    user = UserModel.find_by_clerk_id(g.user["clerk_id"])
    if not user or not user.get("username"):
        return error_response("Set a username on your profile first.", 400)

    username = user["username"]
    if PageModel.username_taken(username, exclude_clerk_id=g.user["clerk_id"]):
        return error_response("Username already used by another page.", 409)

    page = PageModel.create_page(
        clerk_id        = g.user["clerk_id"],
        username        = username,
        title           = data["title"],
        bio             = data.get("bio", ""),
        theme           = data["theme"],
        payment_methods = data.get("payment_methods", []),
    )
    return created_response(page, "Page created.")


# ── GET /api/pages/mine ───────────────────────────────────────────────────────
@pages_bp.get("/mine")
@require_auth
def get_my_page():
    page = PageModel.find_by_user(g.user["clerk_id"])
    if not page:
        return error_response("No page found. Create one first.", 404)
    return success_response(page)


# ── PATCH /api/pages/<id> ─────────────────────────────────────────────────────
@pages_bp.patch("/<page_id>")
@require_auth
@sanitize_json()
def update_page(page_id: str):
    body = get_clean_body()
    try:
        data = PageSchema().load(body)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    # Premium theme gate
    if data.get("theme") and data["theme"] not in PageModel.FREE_THEMES:
        tier = UserModel.get_subscription_tier(g.user["clerk_id"])
        if tier == "free":
            return error_response("This theme requires a subscription.", 403)

    ok, msg = PageModel.update_page(page_id, g.user["clerk_id"], dict(data))
    if not ok:
        status = 403 if "Forbidden" in msg else 404 if "not found" in msg else 409
        return error_response(msg, status)

    page = PageModel.find_by_id(page_id)
    return success_response(page)


# ── DELETE /api/pages/<id> ────────────────────────────────────────────────────
@pages_bp.delete("/<page_id>")
@require_auth
def delete_page(page_id: str):
    page = PageModel.find_by_id(page_id)
    if not page:
        return error_response("Page not found.", 404)
    if page["clerk_id"] != g.user["clerk_id"]:
        return error_response("Forbidden.", 403)

    # Clean up Cloudinary assets
    for field in ("avatar_cloudinary_id", "cover_cloudinary_id"):
        if page.get(field):
            delete_image(page[field])

    ok, msg = PageModel.delete_page(page_id, g.user["clerk_id"])
    if not ok:
        return error_response(msg, 400)

    # Cascade delete ledger entries
    LedgerModel.delete_all_for_page(page_id)

    return success_response(message="Page deleted.")


# ── POST /api/pages/<id>/publish ──────────────────────────────────────────────
@pages_bp.post("/<page_id>/publish")
@require_auth
def publish_page(page_id: str):
    page = PageModel.find_by_id(page_id)
    if not page:
        return error_response("Page not found.", 404)
    if page["clerk_id"] != g.user["clerk_id"]:
        return error_response("Forbidden.", 403)

    # Must have at least one payment method
    if not page.get("payment_methods"):
        return error_response("Add at least one payment method before publishing.", 400)

    ok, msg = PageModel.set_published(page_id, g.user["clerk_id"], True)
    if not ok:
        return error_response(msg, 400)
    return success_response(message="Page published.")


# ── POST /api/pages/<id>/unpublish ────────────────────────────────────────────
@pages_bp.post("/<page_id>/unpublish")
@require_auth
def unpublish_page(page_id: str):
    ok, msg = PageModel.set_published(page_id, g.user["clerk_id"], False)
    if not ok:
        return error_response(msg, 400)
    return success_response(message="Page unpublished.")


# ── POST /api/pages/<id>/avatar ───────────────────────────────────────────────
@pages_bp.post("/<page_id>/avatar")
@require_auth
@require_image("avatar", "avatar")
def upload_page_avatar(page_id: str, validated_file):
    page = PageModel.find_by_id(page_id)
    if not page:
        return error_response("Page not found.", 404)
    if page["clerk_id"] != g.user["clerk_id"]:
        return error_response("Forbidden.", 403)

    if page.get("avatar_cloudinary_id"):
        delete_image(page["avatar_cloudinary_id"])

    try:
        result = upload_image(validated_file, "avatar", public_id_prefix=f"page_{page_id}")
    except RuntimeError as e:
        return error_response(str(e), 500)

    PageModel.update_avatar(page_id, result["url"], result["public_id"])
    return success_response({"avatar_url": result["url"]})


# ── POST /api/pages/<id>/cover ────────────────────────────────────────────────
@pages_bp.post("/<page_id>/cover")
@require_auth
@require_image("cover", "cover")
def upload_page_cover(page_id: str, validated_file):
    page = PageModel.find_by_id(page_id)
    if not page:
        return error_response("Page not found.", 404)
    if page["clerk_id"] != g.user["clerk_id"]:
        return error_response("Forbidden.", 403)

    if page.get("cover_cloudinary_id"):
        delete_image(page["cover_cloudinary_id"])

    try:
        result = upload_image(validated_file, "cover", public_id_prefix=f"cover_{page_id}")
    except RuntimeError as e:
        return error_response(str(e), 500)

    PageModel.update_cover(page_id, result["url"], result["public_id"])
    return success_response({"cover_url": result["url"]})


# ── GET /api/pages/public/<username> ─────────────────────────────────────────
@pages_bp.get("/public/<username>")
@optional_auth
def get_public_page(username: str):
    """
    No auth required. Increments view count.
    Returns only fields safe for public display — never exposes clerk_id.
    """
    page = PageModel.find_public(username)
    if not page:
        return error_response("Page not found.", 404)

    PageModel.increment_views(username)

    # Strip internal fields before returning
    safe_fields = {
        "_id", "username", "title", "bio", "theme",
        "avatar_url", "cover_url", "payment_methods",
        "view_count", "created_at",
    }
    public_page = {k: v for k, v in page.items() if k in safe_fields}
    return success_response(public_page)
