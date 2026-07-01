"""
schemas.py — Marshmallow schemas for request body validation.
These are the server-side counterpart to frontend Zod schemas.
Always validate after sanitizing.
"""
import re
from marshmallow import Schema, fields, validate, validates, ValidationError

_BD_PHONE_RE  = re.compile(r'^(\+880|880|0)?1[3-9]\d{8}$')
_USERNAME_RE  = re.compile(r'^[a-z0-9_-]{3,30}$')
_TXN_RE       = re.compile(r'^[A-Za-z0-9]{4,30}$')


# ─── Reusable validators ─────────────────────────────────────────────────────

def bd_phone(value: str):
    if not _BD_PHONE_RE.match(value.strip()):
        raise ValidationError("Enter a valid Bangladeshi mobile number.")


def txn_id(value: str):
    if not _TXN_RE.match(value.strip()):
        raise ValidationError("Transaction ID must be 4–30 alphanumeric characters.")


# ─── Schemas ─────────────────────────────────────────────────────────────────

class ProfileSchema(Schema):
    display_name = fields.Str(required=True, validate=validate.Length(min=2, max=60))
    username     = fields.Str(required=True)

    @validates("username")
    def validate_username(self, value):
        if not _USERNAME_RE.match(value):
            raise ValidationError(
                "Username must be 3–30 characters: lowercase letters, numbers, _ or -"
            )
        if value.startswith(("-", "_")):
            raise ValidationError("Username cannot start with - or _")


class PaymentMethodSchema(Schema):
    provider     = fields.Str(required=True, validate=validate.OneOf(
                      ["bkash", "nagad", "rocket", "bank"]))
    number       = fields.Str(required=True, validate=[validate.Length(max=20), bd_phone])
    account_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))


class PageSchema(Schema):
    title           = fields.Str(required=True, validate=validate.Length(min=2, max=60))
    bio             = fields.Str(load_default="", validate=validate.Length(max=300))
    theme           = fields.Str(required=True, validate=validate.OneOf(
                        ["noor", "zafran", "layla", "sabz", "qamar", "fajr"]))
    payment_methods = fields.List(fields.Nested(PaymentMethodSchema), load_default=[])


class LedgerEntrySchema(Schema):
    sender_name    = fields.Str(required=True, validate=validate.Length(min=2, max=60))
    sender_note    = fields.Str(load_default="", validate=validate.Length(max=200))
    amount         = fields.Int(required=True, validate=validate.Range(min=1, max=100_000))
    provider       = fields.Str(required=True, validate=validate.OneOf(
                       ["bkash", "nagad", "rocket", "bank"]))
    transaction_id = fields.Str(load_default=None, validate=txn_id)


class SubscriptionSchema(Schema):
    tier           = fields.Str(required=True, validate=validate.OneOf(["monthly", "lifetime"]))
    payment_method = fields.Str(required=True, validate=validate.OneOf(["bkash", "nagad", "rocket"]))
    payment_number = fields.Str(required=True, validate=[validate.Length(max=20), bd_phone])
    transaction_id = fields.Str(required=True, validate=txn_id)
