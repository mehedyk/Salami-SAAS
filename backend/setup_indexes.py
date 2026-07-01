"""
setup_indexes.py — Run this once after first deploy to create all indexes.
Usage: python setup_indexes.py
"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT

load_dotenv()

client = MongoClient(os.environ["MONGO_URI"])
db     = client.get_default_database()

print("Creating indexes...")

# ── users ──────────────────────────────────────────────────────────────────
db.users.create_index([("clerk_id",  ASCENDING)], unique=True,  name="clerk_id_unique")
db.users.create_index([("username",  ASCENDING)], unique=True,  name="username_unique")
db.users.create_index([("email",     ASCENDING)], unique=True,  name="email_unique")
print("✓ users")

# ── salami_pages ───────────────────────────────────────────────────────────
db.salami_pages.create_index([("user_id",   ASCENDING)], name="user_id_idx")
db.salami_pages.create_index([("username",  ASCENDING)], unique=True, name="page_username_unique")
db.salami_pages.create_index([("is_published", ASCENDING)], name="published_idx")
print("✓ salami_pages")

# ── ledger_entries ─────────────────────────────────────────────────────────
db.ledger_entries.create_index([("page_id",    ASCENDING)], name="page_id_idx")
db.ledger_entries.create_index([("created_at", DESCENDING)], name="created_at_idx")
db.ledger_entries.create_index(
    [("page_id", ASCENDING), ("created_at", DESCENDING)],
    name="page_created_compound"
)
print("✓ ledger_entries")

# ── subscriptions ──────────────────────────────────────────────────────────
db.subscriptions.create_index([("user_id",    ASCENDING)],  name="sub_user_idx")
db.subscriptions.create_index([("status",     ASCENDING)],  name="sub_status_idx")
db.subscriptions.create_index([("created_at", DESCENDING)], name="sub_created_idx")
print("✓ subscriptions")

client.close()
print("\nAll indexes created successfully.")
