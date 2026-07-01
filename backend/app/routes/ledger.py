"""
ledger.py — Ledger entry routes.

GET    /api/ledger/<page_id>                  Owner: list all entries (paginated)
POST   /api/ledger/<page_id>                  Public: submit a salami entry
GET    /api/ledger/<page_id>/summary          Owner: aggregated stats
PATCH  /api/ledger/entries/<id>/verify        Owner: mark entry verified
PATCH  /api/ledger/entries/<id>/unverify      Owner: unmark verified
POST   /api/ledger/entries/<id>/receipt       Owner: upload receipt image
DELETE /api/ledger/entries/<id>               Owner: delete entry
"""
from flask import Blueprint, g, request

from ..middleware.auth     import require_auth
from ..middleware.sanitize import sanitize_json, get_clean_body
from ..middleware.schemas  import LedgerEntrySchema
from ..middleware.mime     import require_image
from ..models              import ledger_entry as LedgerModel
from ..models              import salami_page  as PageModel
from ..utils.response      import (
    success_response, error_response, created_response, paginated_response
)
from ..utils.cloudinary_helper import upload_image
from ..utils.security      import parse_pagination
from ..extensions          import limiter
from marshmallow           import ValidationError

ledger_bp = Blueprint("ledger", __name__)


def _assert_page_owner(page_id: str, clerk_id: str):
    """
    Returns (page_dict, None) if the caller owns the page.
    Returns (None, error_response) otherwise.
    """
    page = PageModel.find_by_id(page_id)
    if not page:
        return None, error_response("Page not found.", 404)
    if page["clerk_id"] != clerk_id:
        return None, error_response("Forbidden.", 403)
    return page, None


# ── GET /api/ledger/<page_id> ─────────────────────────────────────────────────
@ledger_bp.get("/<page_id>")
@require_auth
def list_entries(page_id: str):
    _, err = _assert_page_owner(page_id, g.user["clerk_id"])
    if err:
        return err

    page_num, per_page, skip = parse_pagination(request.args)

    # Optional filter: ?verified=true / ?verified=false
    verified_param = request.args.get("verified")
    verified_filter: bool | None = None
    if verified_param == "true":
        verified_filter = True
    elif verified_param == "false":
        verified_filter = False

    entries, total = LedgerModel.find_by_page(
        page_id  = page_id,
        skip     = skip,
        limit    = per_page,
        verified = verified_filter,
    )
    return paginated_response(entries, total, page_num, per_page)


# ── POST /api/ledger/<page_id> ────────────────────────────────────────────────
@ledger_bp.post("/<page_id>")
@limiter.limit("10 per hour")     # prevent ledger spam from one IP
@sanitize_json()
def submit_entry(page_id: str):
    """Public route — no auth. Anyone can send a salami entry."""
    # Page must exist and be published
    page = PageModel.find_by_id(page_id)
    if not page:
        return error_response("Page not found.", 404)
    if not page.get("is_published"):
        return error_response("This page is not accepting salami right now.", 403)

    body = get_clean_body()
    try:
        data = LedgerEntrySchema().load(body)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    # Validate that the provider used is actually listed on the page
    listed_providers = {m["provider"] for m in page.get("payment_methods", [])}
    if data["provider"] not in listed_providers:
        return error_response("That payment method is not on this page.", 400)

    entry = LedgerModel.create_entry(
        page_id        = page_id,
        sender_name    = data["sender_name"],
        sender_note    = data.get("sender_note", ""),
        amount         = data["amount"],
        provider       = data["provider"],
        transaction_id = data.get("transaction_id"),
    )
    return created_response(entry, "Salami sent! 🎉")


# ── GET /api/ledger/<page_id>/summary ─────────────────────────────────────────
@ledger_bp.get("/<page_id>/summary")
@require_auth
def get_summary(page_id: str):
    _, err = _assert_page_owner(page_id, g.user["clerk_id"])
    if err:
        return err

    summary = LedgerModel.page_summary(page_id)
    return success_response(summary)


# ── PATCH /api/ledger/entries/<id>/verify ────────────────────────────────────
@ledger_bp.patch("/entries/<entry_id>/verify")
@require_auth
def verify_entry(entry_id: str):
    entry = LedgerModel.find_by_id(entry_id)
    if not entry:
        return error_response("Entry not found.", 404)

    _, err = _assert_page_owner(entry["page_id"], g.user["clerk_id"])
    if err:
        return err

    ok, msg = LedgerModel.set_verified(entry_id, entry["page_id"], True)
    if not ok:
        return error_response(msg, 400)
    return success_response(message="Entry verified.")


# ── PATCH /api/ledger/entries/<id>/unverify ───────────────────────────────────
@ledger_bp.patch("/entries/<entry_id>/unverify")
@require_auth
def unverify_entry(entry_id: str):
    entry = LedgerModel.find_by_id(entry_id)
    if not entry:
        return error_response("Entry not found.", 404)

    _, err = _assert_page_owner(entry["page_id"], g.user["clerk_id"])
    if err:
        return err

    ok, msg = LedgerModel.set_verified(entry_id, entry["page_id"], False)
    if not ok:
        return error_response(msg, 400)
    return success_response(message="Entry unverified.")


# ── POST /api/ledger/entries/<id>/receipt ─────────────────────────────────────
@ledger_bp.post("/entries/<entry_id>/receipt")
@require_auth
@require_image("receipt", "receipt")
def upload_receipt(entry_id: str, validated_file):
    entry = LedgerModel.find_by_id(entry_id)
    if not entry:
        return error_response("Entry not found.", 404)

    _, err = _assert_page_owner(entry["page_id"], g.user["clerk_id"])
    if err:
        return err

    try:
        result = upload_image(
            validated_file, "receipt",
            public_id_prefix=f"receipt_{entry_id}"
        )
    except RuntimeError as e:
        return error_response(str(e), 500)

    LedgerModel.set_receipt(entry_id, result["url"], result["public_id"])

    # Auto-verify on receipt upload
    LedgerModel.set_verified(entry_id, entry["page_id"], True)

    return success_response({"receipt_url": result["url"]}, "Receipt uploaded and entry verified.")


# ── DELETE /api/ledger/entries/<id> ──────────────────────────────────────────
@ledger_bp.delete("/entries/<entry_id>")
@require_auth
def delete_entry(entry_id: str):
    entry = LedgerModel.find_by_id(entry_id)
    if not entry:
        return error_response("Entry not found.", 404)

    _, err = _assert_page_owner(entry["page_id"], g.user["clerk_id"])
    if err:
        return err

    ok, msg = LedgerModel.delete_entry(entry_id, entry["page_id"])
    if not ok:
        return error_response(msg, 400)
    return success_response(message="Entry deleted.")
