# Salami 🌙

> Create your Eid salami page. Share the link. Collect every gift. Track it all.

---

## Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Frontend  | React 18 + Vite + TypeScript + Tailwind   |
| Backend   | Flask + PyMongo                           |
| Database  | MongoDB Atlas                             |
| Auth      | Clerk                                     |
| Media     | Cloudinary                                |
| Deploy    | Vercel (frontend) + Render (backend)      |

---

## Project structure

```
salami/
├── frontend/
│   └── src/
│       ├── components/       # Navbar, Footer, ProtectedRoute, LoadingSpinner
│       ├── pages/            # Home, Dashboard, NotFound (one TSX + one CSS each)
│       ├── styles/           # variables.css, global.css, themes.css
│       ├── types/            # index.ts — all shared types
│       └── utils/            # api.ts, validation.ts, sanitize.ts, mime.ts
└── backend/
    ├── app/
    │   ├── middleware/        # auth.py, sanitize.py, mime.py, schemas.py
    │   ├── routes/            # health.py (+ future chunks)
    │   └── utils/             # response.py, security.py, cloudinary_helper.py
    ├── setup_indexes.py       # Run once after first deploy
    └── Procfile
```

---

## Setup

### Frontend

```bash
cd frontend
cp .env.example .env          # fill in your keys
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in your keys
python run.py
```

### First-time DB setup

After first deploy, run once to create all MongoDB indexes:

```bash
cd backend
python setup_indexes.py
```

---

## Subscriptions

| Plan     | Price | Duration   |
|----------|-------|------------|
| Eid Pass | ৳17   | 11 months  |
| Lifetime | ৳29   | 5 years    |

Payment via bKash / Nagad / Rocket — manually confirmed within 24h.

---

## Themes

| Theme  | Palette           | Free? |
|--------|-------------------|-------|
| Noor   | Ivory + warm gold | ✓     |
| Zafran | Saffron + earth   | —     |
| Layla  | Midnight + rose   | —     |
| Sabz   | Emerald + cream   | ✓     |
| Qamar  | Navy + silver     | —     |
| Fajr   | Lavender + white  | ✓     |

---

## Security measures (baked into Chunk 0)

- **MongoDB injection**: all `$` operator keys stripped from request bodies before hitting the DB
- **XSS**: `bleach` on backend, `DOMPurify` on frontend — all user strings sanitized
- **MIME spoofing**: magic-byte verification on both frontend and backend for all uploads
- **JWT auth**: RS256 Clerk tokens verified against JWKS, `kid` matched, expiry checked
- **CORS**: strict origin allowlist, `OPTIONS` preflight handled
- **Rate limiting**: Flask-Limiter on all routes (200/day, 60/hour default)
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `HSTS`, `CSP` via `vercel.json`
- **Input validation**: Zod on frontend, Marshmallow on backend — double validation layer
