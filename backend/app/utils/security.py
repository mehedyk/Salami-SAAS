"""
security.py — misc security and utility helpers.
"""
import re
import secrets
import string
from bson import ObjectId
from datetime import datetime, timezone


# ─── ObjectId serializer ─────────────────────────────────────────────────────

def serialize_doc(doc: dict | None) -> dict | None:
    """Convert MongoDB _id ObjectId to string recursively."""
    if doc is None:
        return None
    result = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        elif isinstance(v, dict):
            result[k] = serialize_doc(v)
        elif isinstance(v, list):
            result[k] = [
                serialize_doc(i) if isinstance(i, dict) else
                str(i) if isinstance(i, ObjectId) else i
                for i in v
            ]
        else:
            result[k] = v
    return result


def serialize_docs(docs) -> list[dict]:
    return [serialize_doc(d) for d in docs if d is not None]


# ─── Safe username slug ───────────────────────────────────────────────────────

_SLUG_CLEAN = re.compile(r'[^a-z0-9_-]')
_MULTI_DASH = re.compile(r'[-_]{2,}')

def slugify(value: str) -> str:
    """Lowercase, strip unsafe chars, collapse runs."""
    s = value.lower().strip()
    s = _SLUG_CLEAN.sub('-', s)
    s = _MULTI_DASH.sub('-', s)
    return s.strip('-_')[:30]


# ─── Secure token ────────────────────────────────────────────────────────────

def generate_token(length: int = 32) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# ─── UTC now ─────────────────────────────────────────────────────────────────

def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ─── Pagination helper ───────────────────────────────────────────────────────

def parse_pagination(args: dict, max_per_page: int = 50) -> tuple[int, int, int]:
    """Returns (page, per_page, skip)."""
    try:
        page     = max(1, int(args.get("page",     1)))
        per_page = min(max_per_page, max(1, int(args.get("per_page", 20))))
    except (TypeError, ValueError):
        page, per_page = 1, 20
    skip = (page - 1) * per_page
    return page, per_page, skip
