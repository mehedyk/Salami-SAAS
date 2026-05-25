# EidCard - Project Proposal

> Share the Joy of Eid with the World

---

## Executive Summary

### Problem Statement

In Bangladesh and the broader Muslim community worldwide, sharing Eid greetings traditionally involves physical cards, text messages, or social media posts. These methods lack personalization, have limited reach, and often feel impersonal in an increasingly digital world.

There is no dedicated platform that allows users to create beautiful, shareable Eid greeting cards with authentic Islamic content, customizable themes, and easy sharing capabilities.

### Solution

**EidCard** is a SaaS platform that enables users to create, customize, and share beautiful Eid greeting cards with their loved ones. Users can choose from 10 stunning themes, add personalized messages, include authentic Islamic duas, and share a unique link with anyone worldwide.

### Target Market

- **Primary**: Bangladesh (population 170M+, Muslim majority)
- **Secondary**: Muslim diaspora worldwide (UK, USA, Middle East, India)
- **Total Addressable Market**: 2B+ Muslims globally

### Revenue Model

| Plan | Price | Validity | Features |
|------|-------|----------|----------|
| One-Time | 49 TK (~$0.45) | 11 months | Basic features, limited cards |
| Premium | 99 TK (~$0.90) | Lifetime | Unlimited cards, all features |

**Payment Method**: Manual bKash verification (Transaction ID) for phase 1. Automated bKash merchant integration planned for future.

**Projected Revenue** (conservative estimate):
- 1,000 one-time users: 45,000 TK ($410)
- 500 premium users: 49,500 TK ($450)
- **Total**: 94,500 TK ($860) break-even point

---

## Product Overview

### Core Features

1. **User Authentication**
   - Email/password registration and login
   - Google OAuth integration
   - Password reset via email

2. **Card Creation Wizard**
   - Step 1: Choose Eid type (Al-Fitr or Al-Adha)
   - Step 2: Select from 10 beautiful themes
   - Step 3: Choose background audio
   - Step 4: Enter phone number and custom message
   - Step 5: Preview and publish

3. **Shareable Cards**
   - Unique URL for each card (e.g., eidcard.app/card/abc123)
   - Viewable by anyone without login
   - Mobile-responsive design

4. **Random Dua Cards**
   - Authentic Islamic duas from Quran and Sunnah
   - Automatically displayed on cards
   - Categories: Eid Fitr, Eid Adha, Ramadan, Qurbani, Hajj

5. **10 Stunning Themes**
   - Starlit Night (moon and stars)
   - Lantern Glow (traditional)
   - Sacred Mosque (architecture)
   - Green Paradise (nature)
   - Golden Elegance (luxury)
   - Minimalist White (modern)
   - Crescent Dreams (pastel)
   - Geometric Pattern (traditional)
   - Sunset Harmony (warm)
   - Modern Islamic (contemporary)

6. **Custom Cursor Effects**
   - Unique cursor design per theme
   - Enhances visual experience

### User Plans

| Feature | One-Time (49 TK) | Premium (99 TK) |
|---------|------------------|-----------------|
| Card Creation | ✓ | ✓ |
| Themes | All 10 | All 10 |
| Shareable Link | ✓ | ✓ |
| Edit Cards | 11 months | Unlimited |
| Delete Cards | ✗ | ✓ |
| Analytics | Basic | Advanced |
| Support | Community | Priority |
| Validity | 11 months | Lifetime |

### Admin Panel

**Moderator Features:**
- View pending user requests
- Approve/reject edit requests
- Approve/reject take-down requests

**Admin Features:**
- All moderator features
- Promote/demote moderators
- Stop/pause any card
- Send notifications (single or broadcast)
- Analytics dashboard:
  - Most viewed cards
  - Popular themes
  - Popular audio choices
  - User growth
  - Revenue metrics
  - Geographic distribution

---

## Market Analysis

### Industry Landscape

**Competitors:**
- greetingcard.com - Generic, not Islamic-focused
- canva.com - General design tool, complex
- Basic SMS/WhatsApp - No customization

**EidCard Advantage:**
- Purpose-built for Eid
- Authentic Islamic content
- Simple, intuitive interface
- Affordable pricing
- Mobile-first design

### Unique Selling Proposition

1. **First Mover** - Only dedicated Eid card SaaS in Bangladesh
2. **Authentic Content** - Real duas from Quran and Sunnah
3. **Affordable** - Priced for the Bangladeshi market
4. **Beautiful Themes** - 10 professionally designed options
5. **Easy Sharing** - Simple link-based sharing

---

## Technology Stack

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Hosting)                     │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐ │
│  │  Next.js 14  │    │  API Routes  │   │  MongoDB   │ │
│  │  (Frontend)  │◄──►│  (Backend)   │◄─►│   Atlas    │ │
│  └──────────────┘    └──────────────┘   └────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack Details

| Component | Technology | Cost |
|-----------|------------|------|
| Frontend | Next.js 14 + TypeScript | Free |
| Styling | Tailwind CSS + CSS Modules | Free |
| Database | MongoDB Atlas (512MB) | Free |
| ORM | Prisma | Free |
| Auth | NextAuth.js | Free |
| Email | Resend (100/day) | Free |
| Payments | bKash | Transaction fees |
| Hosting | Vercel (100GB/mo) | Free |
| Domain | .app or custom | ~$10/year |

**Total Operating Cost: $0** (until revenue justifies paid tiers)

### Database Schema

**Users Collection:**
- id, email, passwordHash, name, phone
- role (USER/MODERATOR/ADMIN)
- plan (ONE_TIME/PREMIUM)
- planExpiresAt, emailVerified

**Cards Collection:**
- id, userId, slug, eidType, theme, audio
- phone, customMessage, recipientName
- isPublished, isActive, viewCount

**UserRequests Collection:**
- id, userId, cardId, type, status, details

**Notifications Collection:**
- id, userId, type, title, message, isRead

**Analytics Collection:**
- id, cardId, userId, device, browser, viewedAt

---

## Security Architecture

### Implemented Protections

| Threat | Mitigation |
|--------|------------|
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS | React auto-escape + DOMPurify |
| CSRF | NextAuth built-in tokens |
| Input Validation | Zod schemas on all inputs |
| Password Security | bcrypt (12 rounds) |
| Rate Limiting | API middleware |
| Session Security | HTTP-only, Secure cookies |

### Compliance

- GDPR-compliant data handling
- User data deletion on request
- Transparent data usage policy

---

## Development Roadmap

### Phase 1: Foundation (Week 1)
- [x] Project setup (Next.js + TypeScript + Tailwind)
- [x] MongoDB Atlas + Prisma configuration
- [x] NextAuth.js (Email + Google OAuth)
- [x] Base UI components

### Phase 2: Legal & Marketing (Week 1-2)
- [ ] Terms & Conditions page
- [ ] Privacy Policy page
- [ ] About Us page
- [ ] Landing page

### Phase 3: Core Features (Week 2-3)
- [ ] 10 theme components
- [ ] Card creation wizard
- [ ] Preview functionality
- [ ] Shareable link generation
- [ ] Public card viewer
- [ ] Random dua cards display

### Phase 4: Payments (Week 3-4)
- [ ] bKash integration
- [ ] Plan selection UI
- [ ] Payment webhook handling
- [ ] Access control

### Phase 5: User Dashboard (Week 4)
- [ ] View all cards
- [ ] Edit functionality (premium only)
- [ ] Delete functionality
- [ ] Analytics

### Phase 6: Admin Panel (Week 5-6)
- [ ] Moderator routes
- [ ] Admin routes
- [ ] User request approval
- [ ] Notification system
- [ ] Analytics dashboard

### Phase 7: Documentation & Launch (Week 7)
- [ ] README.md
- [ ] DEPLOYMENT.md
- [ ] SEO optimization
- [ ] Mobile responsiveness
- [ ] Vercel deployment

---

## Financial Projections

### Startup Costs

| Item | Cost |
|------|------|
| Domain | $10/year |
| bKash Merchant Fee | 2% per transaction |
| **Total Initial** | **$10** |

### Revenue Projections (Year 1)

| Month | Users | Revenue (TK) |
|-------|-------|--------------|
| 1 | 50 | 2,450 |
| 3 | 200 | 9,800 |
| 6 | 500 | 24,500 |
| 12 | 1,500 | 73,500 |

### Break-even Analysis

- Break-even point: ~210 users
- At 500 users/year: 24,500 TK profit
- At 1,000 users/year: 49,000 TK profit

---

## Team

### Developer & Founder

**S.M. Mehedy Kawser**
- Software Engineering Student
- Full-stack developer
- Passionate about building impactful solutions

Contact: [github.com/mehedyk](https://github.com/mehedyk)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low user adoption | High | SEO optimization, social media marketing |
| bKash integration issues | Medium | Alternative payment options |
| Competition | Medium | First-mover advantage, community focus |
| Technical scalability | Low | Vercel auto-scales |

---

## Call to Action

EidCard is ready to bring the joy of Eid to millions. With minimal investment and a passionate team, we can build a platform that serves the Muslim community worldwide.

**Join us in spreading Eid joy, one card at a time.**

---

*Document prepared by S.M. Mehedy Kawser*
*Last updated: {new Date().toLocaleDateString()}*
