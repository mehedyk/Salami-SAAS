"""
ledger_entry.py — Salami gift ledger operations.
Entries are created by senders (public, no auth required).
Verified/deleted by the page owner.
"""
from bson import ObjectId
from ..extensions import mongo
from .base import utcnow, to_object_id, serialize, serialize_many


def _col():
    return mongo.db.ledger_entries


# ─── Read ─────────────────────────────────────────────────────────────────────

def find_by_page(
    page_id:  str,
    skip:     int = 0,
    limit:    int = 50,
    verified: bool | None = None,
) -> tuple[list[dict], int]:
    query: dict = {"page_id": page_id}
    if verified is not None:
        query["is_verified"] = verified
    total = _col().count_documents(query)
    docs  = list(_col().find(query).sort("created_at", -1).skip(skip).limit(limit))
    return serialize_many(docs), total


def find_by_id(entry_id: str) -> dict | None:
    oid = to_object_id(entry_id)
    if not oid:
        return None
    return serialize(_col().find_one({"_id": oid}))


def page_summary(page_id: str) -> dict:
    """Aggregate total salami received, entry count, and verification stats."""
    pipeline = [
        {"$match": {"page_id": page_id}},
        {"$group": {
            "_id":            None,
            "total_amount":   {"$sum": "$amount"},
            "total_entries":  {"$sum": 1},
            "verified_count": {"$sum": {"$cond": ["$is_verified", 1, 0]}},
        }},
    ]
    result = list(_col().aggregate(pipeline))
    if not result:
        return {"total_amount": 0, "total_entries": 0, "verified_count": 0}
    r = result[0]
    return {
        "total_amount":    r["total_amount"],
        "total_entries":   r["total_entries"],
        "verified_count":  r["verified_count"],
        "pending_count":   r["total_entries"] - r["verified_count"],
    }


# ─── Write ────────────────────────────────────────────────────────────────────

def create_entry(
    page_id:        str,
    sender_name:    str,
    sender_note:    str,
    amount:         int,
    provider:       str,
    transaction_id: str | None = None,
) -> dict:
    now = utcnow()
    doc = {
        "page_id":        page_id,
        "sender_name":    sender_name,
        "sender_note":    sender_note,
        "amount":         amount,
        "provider":       provider,
        "transaction_id": transaction_id,
        "receipt_url":    None,
        "receipt_cloudinary_id": None,
        "is_verified":    False,
        "created_at":     now,
        "updated_at":     now,
    }
    result = _col().insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


def set_verified(entry_id: str, page_id: str, verified: bool) -> tuple[bool, str]:
    """Only the page owner can verify. page_id check enforces ownership."""
    oid = to_object_id(entry_id)
    if not oid:
        return False, "Invalid entry ID."
    result = _col().update_one(
        {"_id": oid, "page_id": page_id},
        {"$set": {"is_verified": verified, "updated_at": utcnow()}}
    )
    if result.matched_count == 0:
        return False, "Entry not found or forbidden."
    return True, ""


def set_receipt(entry_id: str, url: str, public_id: str) -> None:
    oid = to_object_id(entry_id)
    if not oid:
        return
    _col().update_one({"_id": oid}, {"$set": {
        "receipt_url":            url,
        "receipt_cloudinary_id":  public_id,
        "updated_at":             utcnow(),
    }})


def delete_entry(entry_id: str, page_id: str) -> tuple[bool, str]:
    oid = to_object_id(entry_id)
    if not oid:
        return False, "Invalid entry ID."
    result = _col().delete_one({"_id": oid, "page_id": page_id})
    if result.deleted_count == 0:
        return False, "Entry not found or forbidden."
    return True, ""


def delete_all_for_page(page_id: str) -> None:
    """Called when a page is deleted."""
    _col().delete_many({"page_id": page_id})
