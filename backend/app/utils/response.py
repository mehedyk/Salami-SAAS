from flask import jsonify
from typing import Any


def success_response(data: Any = None, message: str = "OK", status: int = 200):
    payload: dict = {"success": True}
    if message != "OK":
        payload["message"] = message
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status


def error_response(message: str, status: int = 400, errors: dict | None = None):
    payload: dict = {"success": False, "message": message}
    if errors:
        payload["errors"] = errors
    return jsonify(payload), status


def created_response(data: Any = None, message: str = "Created"):
    return success_response(data, message, 201)


def no_content_response():
    return "", 204


def paginated_response(
    items: list,
    total: int,
    page: int,
    per_page: int,
):
    return success_response({
        "items":    items,
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "pages":    (total + per_page - 1) // per_page,
    })
