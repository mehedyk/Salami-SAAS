from flask_pymongo import PyMongo
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import cloudinary

mongo   = PyMongo()
limiter = Limiter(key_func=get_remote_address)


def init_cloudinary(app):
    """Call after app.config is loaded."""
    cloudinary.config(
        cloud_name  = app.config["CLOUDINARY_CLOUD_NAME"],
        api_key     = app.config["CLOUDINARY_API_KEY"],
        api_secret  = app.config["CLOUDINARY_API_SECRET"],
        secure      = True,
    )
