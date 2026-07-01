from flask import Blueprint, current_app
from ..extensions import mongo
from ..utils.response import success_response, error_response

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    """Quick liveness check — no auth required."""
    try:
        # Ping MongoDB
        mongo.db.command("ping")
        db_status = "ok"
    except Exception as e:
        current_app.logger.error("DB ping failed: %s", e)
        db_status = "error"

    if db_status != "ok":
        return error_response("Database unavailable", 503)

    return success_response({"db": db_status, "api": "ok"}, "Healthy")
