# EidCard - Share the Joy of Eid

A beautiful, feature-rich SaaS platform for creating and sharing personalized Eid greeting cards.

![EidCard](https://img.shields.io/badge/Status-In%20Development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

- **10 Beautiful Themes** - Stunning Eid-themed designs
- **Customizable Cards** - Personalize messages, themes, and audio
- **Shareable Links** - Generate unique links for anyone to view
- **Random Dua Cards** - Authentic Islamic duas displayed on cards
- **Authentication** - Email/Password + Google OAuth
- **Payment Integration** - Manual bKash verification (Transaction ID)
- **Admin Dashboard** - Analytics, user management, notifications
- **Security** - XSS protection, SQL injection prevention, rate limiting

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | Frontend & Backend Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| MongoDB | Database |
| Prisma | ORM |
| NextAuth.js | Authentication |
| Resend | Email Service |
| Recharts | Analytics Charts |
| Zod | Validation |
| bKash | Payment Gateway |

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas Account
- Google Cloud Console Account (for OAuth)
- Resend Account (for emails)
- bKash Merchant Account (for payments)

### Clone the Repository

```bash
git clone https://github.com/mehedyk/eid-card-saas.git
cd eid-card-saas
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/eid-card-saas"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend Email
RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"

# bKash Manual Payment
BKASH_NUMBER="01XXXXXXXXX"

# Frontend URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂️ Project Structure

```
eid-card-saas/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── dashboard/          # User dashboard
│   │   ├── card/              # Public card viewer
│   │   ├── admin/              # Admin panel
│   │   ├── terms/              # Terms & Conditions
│   │   ├── privacy/            # Privacy Policy
│   │   ├── about/              # About Us
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── themes/             # 10 theme components
│   │   ├── layout/             # Navbar, Footer
│   │   └── providers/          # Auth providers
│   ├── lib/
│   │   ├── auth.ts             # NextAuth config
│   │   ├── db.ts               # Prisma client
│   │   ├── validation.ts       # Zod schemas
│   │   └── duas/               # Authentic Islamic duas
│   └── prisma/
│       └── schema.prisma       # Database schema
├── docs/
│   ├── PROJECT_PROPOSAL.md     # Investor proposal
│   └── DEPLOYMENT.md           # Deployment guide
└── public/
```

## 🎨 Themes

Each theme has its own component with separate CSS:

| Theme | Name | Description |
|-------|------|-------------|
| Theme1 | Starlit Night | Beautiful night sky with crescent moon |
| Theme2 | Lantern Glow | Traditional Eid lanterns |
| Theme3 | Sacred Mosque | Elegant mosque architecture |
| Theme4 | Green Paradise | Nature-inspired Islamic garden |
| Theme5 | Golden Elegance | Luxurious gold accents |
| Theme6 | Minimalist White | Clean and modern |
| Theme7 | Crescent Dreams | Soft pastel with crescent |
| Theme8 | Geometric Pattern | Traditional Islamic geometry |
| Theme9 | Sunset Harmony | Warm sunset colors |
| Theme10 | Modern Islamic | Contemporary Islamic design |

## 📿 Authentic Duas

The app includes authentic Islamic duas from Quran and Sunnah:

- **Eid Al-Fitr Duas** - For the festival of breaking fast
- **Eid Al-Adha Duas** - For the festival of sacrifice
- **Ramadan Duas** - For the holy month
- **Qurbani Duas** - During sacrifice
- **Hajj Duas** - For pilgrimage

## 💳 Pricing

| Plan | Price | Features |
|------|-------|----------|
| One-Time | 49 TK | Valid for 11 months, basic features |
| Premium | 99 TK | Lifetime access, unlimited cards |

## 🔒 Security Features

- Input validation with Zod
- SQL injection prevention via Prisma ORM
- XSS protection with DOMPurify
- CSRF protection via NextAuth
- Rate limiting on API routes
- bcrypt password hashing (12 rounds)
- HTTP-only, Secure, SameSite cookies

## 🚀 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions to Vercel.

## 👨‍💻 Developer

**S.M. Mehedy Kawser**
- GitHub: [github.com/mehedyk](https://github.com/mehedyk)

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Islamic duas sourced from Quran and authentic Sunnah
- Icons from Lucide React
- UI components inspired by Radix UI
