"""
subscription.py — Subscription request model.
Manual payment flow: user submits → admin approves → user tier upgrades.
"""
from ..extensions import mongo
from .base import utcnow, to_object_id, serialize, serialize_many

STATUS_PENDING  = "pending"
STATUS_APPROVED = "approved"
STATUS_REJECTED = "rejected"

PRICES = {
    "monthly":  17,
    "lifetime": 29,
}


def _col():
    return mongo.db.subscriptions


# ─── Read ─────────────────────────────────────────────────────────────────────

def find_by_user(clerk_id: str) -> list[dict]:
    docs = list(_col().find({"clerk_id": clerk_id}).sort("created_at", -1))
    return serialize_many(docs)


def find_active(clerk_id: str) -> dict | None:
    """Latest approved subscription for a user."""
    return serialize(_col().find_one(
        {"clerk_id": clerk_id, "status": STATUS_APPROVED},
        sort=[("created_at", -1)]
    ))


def find_by_id(sub_id: str) -> dict | None:
    oid = to_object_id(sub_id)
    if not oid:
        return None
    return serialize(_col().find_one({"_id": oid}))


def has_pending(clerk_id: str) -> bool:
    return _col().count_documents({"clerk_id": clerk_id, "status": STATUS_PENDING}) > 0


# ─── Write ────────────────────────────────────────────────────────────────────

def create_subscription(
    clerk_id:       str,
    tier:           str,
    payment_method: str,
    payment_number: str,
    transaction_id: str,
) -> dict:
    now = utcnow()
    doc = {
        "clerk_id":        clerk_id,
        "tier":            tier,
        "price":           PRICES[tier],
        "payment_method":  payment_method,
        "payment_number":  payment_number,
        "transaction_id":  transaction_id,
        "screenshot_url":  None,
        "screenshot_cloudinary_id": None,
        "status":          STATUS_PENDING,
        "admin_note":      None,
        "created_at":      now,
        "updated_at":      now,
    }
    result = _col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


def set_screenshot(sub_id: str, url: str, public_id: str) -> None:
    oid = to_object_id(sub_id)
    if not oid:
        return
    _col().update_one({"_id": oid}, {"$set": {
        "screenshot_url":            url,
        "screenshot_cloudinary_id":  public_id,
        "updated_at":                utcnow(),
    }})


def set_status(sub_id: str, status: str, admin_note: str = "") -> tuple[bool, str]:
    if status not in (STATUS_APPROVED, STATUS_REJECTED):
        return False, "Invalid status."
    oid = to_object_id(sub_id)
    if not oid:
        return False, "Invalid subscription ID."
    result = _col().update_one(
        {"_id": oid},
        {"$set": {"status": status, "admin_note": admin_note, "updated_at": utcnow()}}
    )
    if result.matched_count == 0:
        return False, "Subscription not found."
    return True, ""


# ─── Admin ────────────────────────────────────────────────────────────────────

def list_pending(skip: int = 0, limit: int = 20) -> tuple[list[dict], int]:
    query = {"status": STATUS_PENDING}
    total = _col().count_documents(query)
    docs  = list(_col().find(query).skip(skip).limit(limit).sort("created_at", 1))
    return serialize_many(docs), total


def list_all(skip: int = 0, limit: int = 20) -> tuple[list[dict], int]:
    total = _col().count_documents({})
    docs  = list(_col().find({}).skip(skip).limit(limit).sort("created_at", -1))
    return serialize_many(docs), total


def platform_stats() -> dict:
    pipeline_subs = [
        {"$group": {
            "_id":    "$status",
            "count":  {"$sum": 1},
            "revenue":{"$sum": {"$cond": [{"$eq": ["$status", STATUS_APPROVED]}, "$price", 0]}},
        }}
    ]
    sub_results = list(_col().aggregate(pipeline_subs))
    stats: dict = {"pending": 0, "approved": 0, "rejected": 0, "total_revenue": 0}
    for r in sub_results:
        key = r["_id"]
        if key in stats:
            stats[key] = r["count"]
        stats["total_revenue"] += r["revenue"]
    return stats
