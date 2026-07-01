"""
user.py — User model operations.

A User document is created/synced from Clerk on first sign-in.
clerk_id is the primary lookup key from the JWT sub claim.
"""
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from flask import current_app
from ..extensions import mongo
from .base import utcnow, to_object_id, serialize

# ─── Subscription tier constants ─────────────────────────────────────────────
TIER_FREE     = "free"
TIER_MONTHLY  = "monthly"      # ৳17 / 11 months
TIER_LIFETIME = "lifetime"     # ৳29 / 5 years

TIER_DURATIONS = {
    TIER_MONTHLY:  timedelta(days=335),   # ~11 months
    TIER_LIFETIME: timedelta(days=1825),  # 5 years
}


def _col():
    return mongo.db.users


# ─── Read ─────────────────────────────────────────────────────────────────────

def find_by_clerk_id(clerk_id: str) -> dict | None:
    return serialize(_col().find_one({"clerk_id": clerk_id}))


def find_by_username(username: str) -> dict | None:
    return serialize(_col().find_one({"username": username.lower()}))


def find_by_id(user_id: str) -> dict | None:
    oid = to_object_id(user_id)
    if not oid:
        return None
    return serialize(_col().find_one({"_id": oid}))


def username_taken(username: str, exclude_clerk_id: str | None = None) -> bool:
    query: dict = {"username": username.lower()}
    if exclude_clerk_id:
        query["clerk_id"] = {"$ne": exclude_clerk_id}
    return _col().count_documents(query) > 0


# ─── Write ────────────────────────────────────────────────────────────────────

def upsert_from_clerk(clerk_id: str, email: str, display_name: str = "", avatar_url: str = "") -> dict:
    """
    Called on every sign-in. Creates user if not exists, otherwise
    updates mutable fields (email, avatar) without overwriting user edits.
    Returns the final user document.
    """
    now = utcnow()
    existing = _col().find_one({"clerk_id": clerk_id})

    if existing is None:
        doc = {
            "clerk_id":            clerk_id,
            "email":               email,
            "display_name":        display_name or email.split("@")[0],
            "username":            None,           # set on first profile save
            "avatar_url":          avatar_url or None,
            "subscription":        TIER_FREE,
            "subscription_expires_at": None,
            "is_admin":            False,
            "created_at":          now,
            "updated_at":          now,
        }
        result = _col().insert_one(doc)
        doc["_id"] = result.inserted_id
        return serialize(doc)

    # Update volatile fields only
    _col().update_one(
        {"clerk_id": clerk_id},
        {"$set": {
            "email":      email,
            "updated_at": now,
            **({"avatar_url": avatar_url} if avatar_url else {}),
        }}
    )
    return serialize(_col().find_one({"clerk_id": clerk_id}))


def update_profile(clerk_id: str, display_name: str, username: str) -> tuple[bool, str]:
    """
    Returns (True, "") on success.
    Returns (False, error_message) if username is taken.
    """
    username = username.lower()
    if username_taken(username, exclude_clerk_id=clerk_id):
        return False, "Username is already taken."

    _col().update_one(
        {"clerk_id": clerk_id},
        {"$set": {
            "display_name": display_name,
            "username":     username,
            "updated_at":   utcnow(),
        }}
    )
    return True, ""


def update_avatar(clerk_id: str, avatar_url: str, cloudinary_public_id: str) -> None:
    _col().update_one(
        {"clerk_id": clerk_id},
        {"$set": {
            "avatar_url":              avatar_url,
            "avatar_cloudinary_id":    cloudinary_public_id,
            "updated_at":              utcnow(),
        }}
    )


def activate_subscription(clerk_id: str, tier: str) -> None:
    expires_at = utcnow() + TIER_DURATIONS[tier]
    _col().update_one(
        {"clerk_id": clerk_id},
        {"$set": {
            "subscription":            tier,
            "subscription_expires_at": expires_at,
            "updated_at":              utcnow(),
        }}
    )


def get_subscription_tier(clerk_id: str) -> str:
    """Returns current effective tier (degrades to free if expired)."""
    user = _col().find_one({"clerk_id": clerk_id}, {"subscription": 1, "subscription_expires_at": 1})
    if not user:
        return TIER_FREE
    tier    = user.get("subscription", TIER_FREE)
    expires = user.get("subscription_expires_at")
    if tier == TIER_FREE:
        return TIER_FREE
    if expires and expires < utcnow():
        # Expire in place
        _col().update_one({"clerk_id": clerk_id}, {"$set": {"subscription": TIER_FREE}})
        return TIER_FREE
    return tier


# ─── Admin ────────────────────────────────────────────────────────────────────

def list_users(skip: int = 0, limit: int = 20) -> tuple[list[dict], int]:
    total = _col().count_documents({})
    docs  = list(_col().find({}, {"clerk_id": 0}).skip(skip).limit(limit).sort("created_at", -1))
    return [serialize(d) for d in docs], total


def is_admin(clerk_id: str) -> bool:
    doc = _col().find_one({"clerk_id": clerk_id}, {"is_admin": 1})
    return bool(doc and doc.get("is_admin"))
