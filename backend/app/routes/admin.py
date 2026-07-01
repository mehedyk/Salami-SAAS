"""
admin.py — Admin-only routes.
All routes require auth + is_admin check.

GET   /api/admin/subscriptions             List all pending subs (paginated)
GET   /api/admin/subscriptions/all         List all subs regardless of status
POST  /api/admin/subscriptions/<id>/approve  Approve + activate user tier
POST  /api/admin/subscriptions/<id>/reject   Reject with optional note
GET   /api/admin/users                     List all users (paginated)
GET   /api/admin/stats                     Platform stats
"""
from flask import Blueprint, g

from ..middleware.auth     import require_auth
from ..middleware.sanitize import sanitize_json, get_clean_body
from ..models              import subscription as SubModel
from ..models              import user as UserModel
from ..utils.response      import (
    success_response, error_response, paginated_response
)
from ..utils.security      import parse_pagination
from flask import request

admin_bp = Blueprint("admin", __name__)


def _require_admin():
    """Returns error response if caller is not admin, else None."""
    if not UserModel.is_admin(g.user["clerk_id"]):
        return error_response("Admin access required.", 403)
    return None


# ── GET /api/admin/subscriptions ─────────────────────────────────────────────
@admin_bp.get("/subscriptions")
@require_auth
def list_pending_subs():
    err = _require_admin()
    if err:
        return err

    page_num, per_page, skip = parse_pagination(request.args)
    subs, total = SubModel.list_pending(skip, per_page)
    return paginated_response(subs, total, page_num, per_page)


# ── GET /api/admin/subscriptions/all ─────────────────────────────────────────
@admin_bp.get("/subscriptions/all")
@require_auth
def list_all_subs():
    err = _require_admin()
    if err:
        return err

    page_num, per_page, skip = parse_pagination(request.args)
    subs, total = SubModel.list_all(skip, per_page)
    return paginated_response(subs, total, page_num, per_page)


# ── POST /api/admin/subscriptions/<id>/approve ────────────────────────────────
@admin_bp.post("/subscriptions/<sub_id>/approve")
@require_auth
def approve_subscription(sub_id: str):
    err = _require_admin()
    if err:
        return err

    sub = SubModel.find_by_id(sub_id)
    if not sub:
        return error_response("Subscription not found.", 404)
    if sub["status"] != "pending":
        return error_response(f"Subscription is already {sub['status']}.", 400)

    # 1. Update subscription status
    ok, msg = SubModel.set_status(sub_id, "approved")
    if not ok:
        return error_response(msg, 400)

    # 2. Upgrade user tier
    UserModel.activate_subscription(sub["clerk_id"], sub["tier"])

    return success_response(message=f"Subscription approved. User upgraded to '{sub['tier']}'.")


# ── POST /api/admin/subscriptions/<id>/reject ─────────────────────────────────
@admin_bp.post("/subscriptions/<sub_id>/reject")
@require_auth
@sanitize_json()
def reject_subscription(sub_id: str):
    err = _require_admin()
    if err:
        return err

    sub = SubModel.find_by_id(sub_id)
    if not sub:
        return error_response("Subscription not found.", 404)
    if sub["status"] != "pending":
        return error_response(f"Subscription is already {sub['status']}.", 400)

    body       = get_clean_body()
    admin_note = str(body.get("note", ""))[:300]

    ok, msg = SubModel.set_status(sub_id, "rejected", admin_note)
    if not ok:
        return error_response(msg, 400)

    return success_response(message="Subscription rejected.")


# ── GET /api/admin/users ──────────────────────────────────────────────────────
@admin_bp.get("/users")
@require_auth
def list_users():
    err = _require_admin()
    if err:
        return err

    page_num, per_page, skip = parse_pagination(request.args)
    users, total = UserModel.list_users(skip, per_page)
    return paginated_response(users, total, page_num, per_page)


# ── GET /api/admin/stats ──────────────────────────────────────────────────────
@admin_bp.get("/stats")
@require_auth
def get_stats():
    err = _require_admin()
    if err:
        return err

    sub_stats  = SubModel.platform_stats()
    user_count = UserModel.list_users(0, 1)[1]

    return success_response({
        "users":         user_count,
        "subscriptions": sub_stats,
    })
