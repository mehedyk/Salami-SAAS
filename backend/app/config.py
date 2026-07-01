import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY  = os.environ["SECRET_KEY"]
    DEBUG       = os.getenv("FLASK_ENV") == "development"
    TESTING     = False

    # MongoDB
    MONGO_URI   = os.environ["MONGO_URI"]

    # Clerk
    CLERK_SECRET_KEY = os.environ["CLERK_SECRET_KEY"]
    CLERK_JWKS_URL   = os.environ["CLERK_JWKS_URL"]

    # Cloudinary
    CLOUDINARY_CLOUD_NAME  = os.environ["CLOUDINARY_CLOUD_NAME"]
    CLOUDINARY_API_KEY     = os.environ["CLOUDINARY_API_KEY"]
    CLOUDINARY_API_SECRET  = os.environ["CLOUDINARY_API_SECRET"]

    # CORS
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Rate limiting
    RATELIMIT_DEFAULT         = "200 per day;60 per hour"
    RATELIMIT_STORAGE_URL     = "memory://"
    RATELIMIT_HEADERS_ENABLED = True


class TestingConfig(Config):
    TESTING   = True
    MONGO_URI = "mongodb://localhost:27017/salami_test"
