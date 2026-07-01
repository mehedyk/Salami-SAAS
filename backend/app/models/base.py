"""
base.py — Shared MongoDB helpers used by all model modules.
All models are plain dicts — no ODM. PyMongo only.
"""
from datetime import datetime, timezone
from bson import ObjectId
from flask import current_app
from ..extensions import mongo


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def to_object_id(value: str) -> ObjectId | None:
    """Safely convert a string to ObjectId. Returns None on failure."""
    try:
        return ObjectId(value)
    except Exception:
        return None


def is_valid_object_id(value: str) -> bool:
    try:
        ObjectId(value)
        return True
    except Exception:
        return False


def serialize(doc: dict | None) -> dict | None:
    """Recursively stringify ObjectIds and isoformat datetimes."""
    if doc is None:
        return None
    result = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        elif isinstance(v, dict):
            result[k] = serialize(v)
        elif isinstance(v, list):
            result[k] = [
                serialize(i) if isinstance(i, dict)
                else str(i) if isinstance(i, ObjectId)
                else i.isoformat() if isinstance(i, datetime)
                else i
                for i in v
            ]
        else:
            result[k] = v
    return result


def serialize_many(docs) -> list[dict]:
    return [serialize(d) for d in docs if d is not None]
