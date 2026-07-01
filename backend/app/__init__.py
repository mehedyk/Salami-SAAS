from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import mongo, limiter, init_cloudinary
from .routes.health        import health_bp
from .routes.users         import users_bp
from .routes.pages         import pages_bp
from .routes.ledger        import ledger_bp
from .routes.subscriptions import subscriptions_bp
from .routes.admin         import admin_bp


def create_app(config_class: type = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ── CORS ──────────────────────────────────────────────────────
    CORS(app, resources={
        r"/api/*": {
            "origins":        app.config["FRONTEND_URL"],
            "methods":        ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers":  ["Content-Type", "Authorization", "X-Requested-With"],
            "expose_headers": ["X-Total-Count"],
            "max_age":        600,
        }
    })

    # ── Extensions ────────────────────────────────────────────────
    mongo.init_app(app)
    limiter.init_app(app)
    init_cloudinary(app)

    # ── Security headers ──────────────────────────────────────────
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"]  = "nosniff"
        response.headers["X-Frame-Options"]          = "DENY"
        response.headers["Referrer-Policy"]          = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"]            = "no-store"
        return response

    # ── Error handlers ────────────────────────────────────────────
    from flask import jsonify

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"success": False, "message": "Route not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(_e):
        return jsonify({"success": False, "message": "Method not allowed"}), 405

    @app.errorhandler(429)
    def rate_limited(_e):
        return jsonify({"success": False, "message": "Too many requests. Slow down."}), 429

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.error("500: %s", e)
        return jsonify({"success": False, "message": "Internal server error"}), 500

    # ── Blueprints ────────────────────────────────────────────────
    app.register_blueprint(health_bp,        url_prefix="/api")
    app.register_blueprint(users_bp,         url_prefix="/api/users")
    app.register_blueprint(pages_bp,         url_prefix="/api/pages")
    app.register_blueprint(ledger_bp,        url_prefix="/api/ledger")
    app.register_blueprint(subscriptions_bp, url_prefix="/api/subscriptions")
    app.register_blueprint(admin_bp,         url_prefix="/api/admin")

    return app
