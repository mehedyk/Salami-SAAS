"""
subscriptions.py — Subscription routes.

POST  /api/subscriptions                  Submit subscription request
GET   /api/subscriptions/mine             Get current user's subscriptions
GET   /api/subscriptions/mine/active      Get active subscription tier
POST  /api/subscriptions/<id>/screenshot  Upload payment screenshot
"""
from flask import Blueprint, g

from ..middleware.auth     import require_auth
from ..middleware.sanitize import sanitize_json, get_clean_body
from ..middleware.schemas  import SubscriptionSchema
from ..middleware.mime     import require_image
from ..models              import subscription as SubModel
from ..models              import user as UserModel
from ..utils.response      import success_response, error_response, created_response
from ..utils.cloudinary_helper import upload_image
from marshmallow           import ValidationError

subscriptions_bp = Blueprint("subscriptions", __name__)


# ── POST /api/subscriptions ───────────────────────────────────────────────────
@subscriptions_bp.post("/")
@require_auth
@sanitize_json()
def create_subscription():
    # Block if already has a pending request
    if SubModel.has_pending(g.user["clerk_id"]):
        return error_response(
            "You already have a pending subscription request. "
            "Wait for admin approval before submitting another.", 409
        )

    body = get_clean_body()
    try:
        data = SubscriptionSchema().load(body)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    sub = SubModel.create_subscription(
        clerk_id       = g.user["clerk_id"],
        tier           = data["tier"],
        payment_method = data["payment_method"],
        payment_number = data["payment_number"],
        transaction_id = data["transaction_id"],
    )
    return created_response(sub, "Subscription request submitted. Upload your screenshot next.")


# ── GET /api/subscriptions/mine ───────────────────────────────────────────────
@subscriptions_bp.get("/mine")
@require_auth
def get_my_subscriptions():
    subs = SubModel.find_by_user(g.user["clerk_id"])
    return success_response(subs)


# ── GET /api/subscriptions/mine/active ───────────────────────────────────────
@subscriptions_bp.get("/mine/active")
@require_auth
def get_active_tier():
    tier = UserModel.get_subscription_tier(g.user["clerk_id"])
    sub  = SubModel.find_active(g.user["clerk_id"])
    return success_response({
        "tier":       tier,
        "is_premium": tier != "free",
        "subscription": sub,
    })


# ── POST /api/subscriptions/<id>/screenshot ───────────────────────────────────
@subscriptions_bp.post("/<sub_id>/screenshot")
@require_auth
@require_image("screenshot", "receipt")
def upload_screenshot(sub_id: str, validated_file):
    sub = SubModel.find_by_id(sub_id)
    if not sub:
        return error_response("Subscription not found.", 404)
    if sub["clerk_id"] != g.user["clerk_id"]:
        return error_response("Forbidden.", 403)
    if sub["status"] != "pending":
        return error_response("Can only upload screenshot for pending subscriptions.", 400)

    try:
        result = upload_image(
            validated_file, "receipt",
            public_id_prefix=f"sub_{sub_id}"
        )
    except RuntimeError as e:
        return error_response(str(e), 500)

    SubModel.set_screenshot(sub_id, result["url"], result["public_id"])
    return success_response({"screenshot_url": result["url"]}, "Screenshot uploaded. Awaiting admin review.")
