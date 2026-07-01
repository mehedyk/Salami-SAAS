// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  _id:                    string
  clerk_id:               string
  username:               string | null
  email:                  string
  display_name:           string
  avatar_url?:            string | null
  avatar_cloudinary_id?:  string | null
  subscription:           SubscriptionTier
  subscription_expires_at?: string | null
  is_admin:               boolean
  created_at:             string
  updated_at:             string
}

// ─── Salami Page ──────────────────────────────────────────────────────────────
export interface SalamiPage {
  _id:                   string
  clerk_id:              string
  username:              string
  title:                 string
  bio:                   string
  theme:                 ThemeId
  avatar_url?:           string | null
  avatar_cloudinary_id?: string | null
  cover_url?:            string | null
  cover_cloudinary_id?:  string | null
  payment_methods:       PaymentMethod[]
  is_published:          boolean
  view_count:            number
  created_at:            string
  updated_at:            string
}

export interface PaymentMethod {
  provider:     'bkash' | 'nagad' | 'rocket' | 'bank'
  number:       string
  account_name: string
  // Local frontend alias kept for form state compatibility
  accountName?: string
}

// ─── Ledger ───────────────────────────────────────────────────────────────────
export interface LedgerEntry {
  _id:                    string
  page_id:                string
  sender_name:            string
  sender_note?:           string
  amount:                 number
  provider:               PaymentMethod['provider']
  transaction_id?:        string | null
  receipt_url?:           string | null
  receipt_cloudinary_id?: string | null
  is_verified:            boolean
  created_at:             string
  updated_at:             string
}

// ─── Subscription ─────────────────────────────────────────────────────────────
export type SubscriptionTier = 'free' | 'monthly' | 'lifetime'

export interface Subscription {
  _id:                       string
  clerk_id:                  string
  tier:                      Exclude<SubscriptionTier, 'free'>
  price:                     number
  payment_method:            'bkash' | 'nagad' | 'rocket'
  payment_number:            string
  transaction_id:            string
  screenshot_url?:           string | null
  screenshot_cloudinary_id?: string | null
  status:                    'pending' | 'approved' | 'rejected'
  admin_note?:               string | null
  created_at:                string
  updated_at:                string
}

// ─── Themes ───────────────────────────────────────────────────────────────────
export type ThemeId = 'noor' | 'zafran' | 'layla' | 'sabz' | 'qamar' | 'fajr'

export interface Theme {
  id:        ThemeId
  label:     string
  isPremium: boolean
  preview:   string
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success:  boolean
  data?:    T
  message?: string
  errors?:  Record<string, string>
}

export interface PaginatedResponse<T> {
  items:    T[]
  total:    number
  page:     number
  per_page: number
  pages:    number
}
