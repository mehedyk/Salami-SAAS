"""
salami_page.py — Salami page model operations.
One user can have one page (enforced at application layer).
"""
from bson import ObjectId
from ..extensions import mongo
from .base import utcnow, to_object_id, serialize, serialize_many

# Free themes (always accessible)
FREE_THEMES    = {"noor", "sabz", "fajr"}
PREMIUM_THEMES = {"zafran", "layla", "qamar"}
ALL_THEMES     = FREE_THEMES | PREMIUM_THEMES


def _col():
    return mongo.db.salami_pages


# ─── Read ─────────────────────────────────────────────────────────────────────

def find_by_user(clerk_id: str) -> dict | None:
    return serialize(_col().find_one({"clerk_id": clerk_id}))


def find_by_id(page_id: str) -> dict | None:
    oid = to_object_id(page_id)
    if not oid:
        return None
    return serialize(_col().find_one({"_id": oid}))


def find_public(username: str) -> dict | None:
    """Public page — only return if published."""
    return serialize(_col().find_one({
        "username":    username.lower(),
        "is_published": True,
    }))


def username_taken(username: str, exclude_clerk_id: str | None = None) -> bool:
    query: dict = {"username": username.lower()}
    if exclude_clerk_id:
        query["clerk_id"] = {"$ne": exclude_clerk_id}
    return _col().count_documents(query) > 0


def user_has_page(clerk_id: str) -> bool:
    return _col().count_documents({"clerk_id": clerk_id}) > 0


# ─── Write ────────────────────────────────────────────────────────────────────

def create_page(
    clerk_id:        str,
    username:        str,
    title:           str,
    bio:             str,
    theme:           str,
    payment_methods: list[dict],
) -> dict:
    now = utcnow()
    doc = {
        "clerk_id":        clerk_id,
        "username":        username.lower(),
        "title":           title,
        "bio":             bio,
        "theme":           theme,
        "avatar_url":      None,
        "avatar_cloudinary_id": None,
        "cover_url":       None,
        "cover_cloudinary_id":  None,
        "payment_methods": payment_methods,
        "is_published":    False,
        "view_count":      0,
        "created_at":      now,
        "updated_at":      now,
    }
    result = _col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


def update_page(page_id: str, clerk_id: str, fields: dict) -> tuple[bool, str]:
    """
    Update allowed fields. Verifies ownership via clerk_id.
    Returns (True, "") or (False, error).
    """
    oid = to_object_id(page_id)
    if not oid:
        return False, "Invalid page ID."

    # Check ownership
    existing = _col().find_one({"_id": oid})
    if not existing:
        return False, "Page not found."
    if existing["clerk_id"] != clerk_id:
        return False, "Forbidden."

    # Check username uniqueness if changing
    new_username = fields.get("username")
    if new_username and new_username.lower() != existing["username"]:
        if username_taken(new_username, exclude_clerk_id=clerk_id):
            return False, "That username is already taken."
        fields["username"] = new_username.lower()

    # Only allow safe fields
    allowed = {"title", "bio", "theme", "payment_methods", "username"}
    safe    = {k: v for k, v in fields.items() if k in allowed}
    safe["updated_at"] = utcnow()

    _col().update_one({"_id": oid}, {"$set": safe})
    return True, ""


def set_published(page_id: str, clerk_id: str, published: bool) -> tuple[bool, str]:
    oid = to_object_id(page_id)
    if not oid:
        return False, "Invalid page ID."
    result = _col().update_one(
        {"_id": oid, "clerk_id": clerk_id},
        {"$set": {"is_published": published, "updated_at": utcnow()}}
    )
    if result.matched_count == 0:
        return False, "Page not found or forbidden."
    return True, ""


def update_avatar(page_id: str, url: str, public_id: str) -> None:
    oid = to_object_id(page_id)
    if not oid:
        return
    _col().update_one({"_id": oid}, {"$set": {
        "avatar_url":           url,
        "avatar_cloudinary_id": public_id,
        "updated_at":           utcnow(),
    }})


def update_cover(page_id: str, url: str, public_id: str) -> None:
    oid = to_object_id(page_id)
    if not oid:
        return
    _col().update_one({"_id": oid}, {"$set": {
        "cover_url":           url,
        "cover_cloudinary_id": public_id,
        "updated_at":          utcnow(),
    }})


def increment_views(username: str) -> None:
    _col().update_one(
        {"username": username.lower()},
        {"$inc": {"view_count": 1}}
    )


def delete_page(page_id: str, clerk_id: str) -> tuple[bool, str]:
    oid = to_object_id(page_id)
    if not oid:
        return False, "Invalid page ID."
    result = _col().delete_one({"_id": oid, "clerk_id": clerk_id})
    if result.deleted_count == 0:
        return False, "Page not found or forbidden."
    return True, ""


# ─── Admin ────────────────────────────────────────────────────────────────────

def list_pages(skip: int = 0, limit: int = 20) -> tuple[list[dict], int]:
    total = _col().count_documents({})
    docs  = list(_col().find({}).skip(skip).limit(limit).sort("created_at", -1))
    return serialize_many(docs), total
