"""
mime.py — Server-side MIME + magic-byte validation for uploaded files.

Never trust the Content-Type the client sends.
We read the first 12 bytes and check the actual magic signature.
"""
import os
from functools import wraps
from typing import Literal

from flask import request
from werkzeug.datastructures import FileStorage

from ..utils.response import error_response

# ─── Config ───────────────────────────────────────────────────────────────────

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

MAX_SIZES: dict[str, int] = {
    "avatar":  2 * 1024 * 1024,   # 2 MB
    "cover":   4 * 1024 * 1024,   # 4 MB
    "receipt": 5 * 1024 * 1024,   # 5 MB
}

# Magic byte signatures
_MAGIC: list[tuple[bytes, str]] = [
    (b"\xff\xd8\xff",           "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n",     "image/png"),
    (b"RIFF",                   "image/webp"),   # RIFF....WEBP checked below
]


def _check_magic(header: bytes) -> bool:
    for sig, _ in _MAGIC:
        if header[:len(sig)] == sig:
            if sig == b"RIFF":
                # RIFF????WEBP
                return header[8:12] == b"WEBP"
            return True
    return False


# ─── Validation function ──────────────────────────────────────────────────────

FileType = Literal["avatar", "cover", "receipt"]


def validate_uploaded_file(
    file: FileStorage,
    file_type: FileType,
) -> tuple[bool, str]:
    """
    Returns (True, "") on success.
    Returns (False, error_message) on failure.
    """
    if not file or file.filename == "":
        return False, "No file provided."

    # 1. Extension
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File extension '{ext}' not allowed. Use JPG, PNG, or WebP."

    # 2. Content-Type header (weak check — magic bytes below is the real one)
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    if content_type not in ALLOWED_MIME_TYPES:
        return False, "Invalid file type."

    # 3. Size
    file.seek(0, 2)                 # seek to end
    size = file.tell()
    file.seek(0)                    # reset
    max_size = MAX_SIZES.get(file_type, MAX_SIZES["receipt"])
    if size > max_size:
        mb = max_size // (1024 * 1024)
        return False, f"File too large. Maximum size for {file_type} is {mb} MB."

    if size == 0:
        return False, "Uploaded file is empty."

    # 4. Magic bytes — the real MIME check
    header = file.read(12)
    file.seek(0)
    if not _check_magic(header):
        return False, "File content does not match a valid image format."

    return True, ""


# ─── Decorator ────────────────────────────────────────────────────────────────

def require_image(field: str, file_type: FileType):
    """
    Decorator: validates a file upload from request.files[field].
    Injects validated_file=<FileStorage> into the route kwargs.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            uploaded = request.files.get(field)
            if not uploaded:
                return error_response(f"No file uploaded for field '{field}'", 400)
            ok, msg = validate_uploaded_file(uploaded, file_type)
            if not ok:
                return error_response(msg, 400)
            kwargs["validated_file"] = uploaded
            return f(*args, **kwargs)
        return wrapper
    return decorator
