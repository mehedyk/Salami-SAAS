"""
cloudinary_helper.py — Wrapper around cloudinary.uploader with
folder structure, eager transforms, and error handling.
"""
import cloudinary.uploader
from werkzeug.datastructures import FileStorage
from typing import Literal

AssetType = Literal["avatar", "cover", "receipt"]

_FOLDER_MAP = {
    "avatar":  "salami/avatars",
    "cover":   "salami/covers",
    "receipt": "salami/receipts",
}

# Eager transforms per type
_TRANSFORMS = {
    "avatar":  [{"width": 256,  "height": 256,  "crop": "fill", "gravity": "face", "quality": "auto:good"}],
    "cover":   [{"width": 1200, "height": 400,  "crop": "fill", "quality": "auto:good"}],
    "receipt": [{"width": 1200, "quality": "auto:good"}],
}


def upload_image(
    file: FileStorage,
    asset_type: AssetType,
    public_id_prefix: str = "",
) -> dict:
    """
    Upload a file to Cloudinary.
    Returns {'url': str, 'public_id': str} on success.
    Raises RuntimeError on failure.
    """
    folder    = _FOLDER_MAP[asset_type]
    eager     = _TRANSFORMS[asset_type]
    public_id = f"{folder}/{public_id_prefix}" if public_id_prefix else None

    try:
        result = cloudinary.uploader.upload(
            file.stream,
            folder=folder,
            public_id=public_id,
            eager=eager,
            eager_async=False,
            resource_type="image",
            allowed_formats=["jpg", "jpeg", "png", "webp"],
            invalidate=True,
        )
        url = result.get("eager", [{}])[0].get("secure_url") or result["secure_url"]
        return {"url": url, "public_id": result["public_id"]}
    except Exception as e:
        raise RuntimeError(f"Cloudinary upload failed: {e}") from e


def delete_image(public_id: str) -> None:
    """Delete an asset from Cloudinary. Silently ignores errors."""
    try:
        cloudinary.uploader.destroy(public_id, resource_type="image", invalidate=True)
    except Exception:
        pass
