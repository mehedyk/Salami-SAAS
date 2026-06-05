# 🌙 EidCard — Deployment Guide

## Why Login Was Failing

The "Sign-in failed. Please try again." error had **two root causes**:

1. **`NEXTAUTH_SECRET` missing or wrong** — Without a secret, NextAuth can't sign JWTs. Every `signIn()` call silently fails.
2. **`NEXTAUTH_URL` mismatch** — NextAuth uses this for CSRF validation. If it doesn't match the actual request origin, credentials sign-in returns an error.

The LaunchDarkly errors in the console were **not** causing the login failure — those are just an ad-blocker blocking analytics pings. Ignore them.

---

## Quick Start (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env.local
# Fill in your values (MongoDB URI, NextAuth secret, etc.)

# 3. Push Prisma schema to MongoDB
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Run dev server
npm run dev
# → Open http://localhost:3000
```

---

## Deploy to Vercel

### Step 1 — Push code to GitHub
```bash
git init
git add .
git commit -m "Initial EidCard rebuild"
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

### Step 2 — Import on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Build command: `prisma generate && next build`

### Step 3 — Set Environment Variables
In Vercel → Project → Settings → Environment Variables, add **all** of these:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas URI |
| `NEXTAUTH_URL` | `https://salami-saas.vercel.app` (**exact URL, no trailing slash**) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and paste the output |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `NEXT_PUBLIC_APP_URL` | `https://salami-saas.vercel.app` |
| `NEXT_PUBLIC_BKASH_NUMBER` | Your bKash number |

### Step 4 — MongoDB Atlas Setup
1. Log in to https://cloud.mongodb.com
2. Go to **Network Access** → Add IP Address → `0.0.0.0/0` (allow anywhere — needed for Vercel serverless)
3. Create a database user with read/write permissions
4. Copy the connection string into `MONGODB_URI`

### Step 5 — Google OAuth Setup
1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorised redirect URIs:
   - `https://salami-saas.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
6. Copy Client ID and Secret to Vercel env vars

### Step 6 — Deploy
Click **Deploy** in Vercel. First deploy runs `prisma generate && next build`.

---

## Create Your First Admin User

After deploying, register a normal user at `/register`, then:

```bash
# Using MongoDB Atlas Data Browser, or mongosh:
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "ADMIN" } }
)
```

Now visit `/admin` to access the admin panel.

---

## Project Structure

```
eidcard/
├── prisma/schema.prisma          # MongoDB schema
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, Register, Forgot-password
│   │   ├── api/                  # All API routes
│   │   ├── card/[slug]/          # Public card view
│   │   ├── dashboard/            # User dashboard + card create
│   │   ├── admin/                # Admin panel
│   │   ├── globals.css           # SINGLE CSS file — no CSS modules
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── themes/index.tsx      # ALL 10 themes — single file, no CSS modules
│   │   ├── ui/                   # Button, Input, Label, Card, Toaster
│   │   └── providers/            # NextAuth SessionProvider wrapper
│   └── lib/
│       ├── auth.ts               # NextAuth config
│       ├── db.ts                 # Prisma client singleton
│       ├── duas/                 # Islamic duas library
│       ├── validation.ts         # Zod schemas
│       ├── sanitize.ts           # DOMPurify server-side
│       ├── utils.ts              # cn(), generateSlug(), etc.
│       └── bkash.ts              # bKash helpers
├── .env.example                  # Copy → .env.local
├── tailwind.config.ts            # Full design system with custom tokens
└── vercel.json                   # Build config
```

---

## What Was Rebuilt & Why

| Before | After | Why |
|---|---|---|
| 10 CSS module files | 1 `themes/index.tsx` | Eliminates CSS specificity fights |
| CSS Modules + Tailwind mix | Pure Tailwind + CSS custom props | Single cascade, zero conflicts |
| Generic error "Sign-in failed" | Specific error messages | Better UX, easier debugging |
| No password strength UI | Live password strength meter | Security awareness |
| Scattered keyframes in CSS modules | All animations in `tailwind.config.ts` | One source of truth |
| Hard-coded font imports | CSS variable-based font system | Theme-safe, no FOUT |
| Mixed `className` and `style` in themes | Inline styles via JS config object | Type-safe, no CSS leakage |

---

## Troubleshooting

**Login still failing after deploying?**
1. Check Vercel logs → Functions → `/api/auth/[...nextauth]`
2. Verify `NEXTAUTH_URL` matches exactly (no trailing slash, correct protocol)
3. Verify `NEXTAUTH_SECRET` is set and non-empty
4. Check MongoDB Atlas Network Access allows `0.0.0.0/0`

**Cards showing 404?**
- Cards need `isPublished: true` in the DB. The new card creation API always sets this.

**Google OAuth not working?**
- Check the redirect URI in Google Cloud Console matches your domain exactly
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in Vercel

**Prisma generate failing?**
- Run `npx prisma generate` locally first to verify schema is valid
- Check `MONGODB_URI` is set correctly

---

## Adding a Logo / Favicon

1. Replace `/public/favicon.ico` with your favicon
2. Add `icon.png`, `apple-icon.png` to `/public`
3. Update `/src/app/layout.tsx` metadata icons field:
   ```ts
   icons: {
     icon: "/favicon.ico",
     apple: "/apple-icon.png",
   }
   ```
