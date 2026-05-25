import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// FIX: Replaced the in-memory Map rate limiter with Upstash Redis.
//
// WHY: Vercel (and any serverless platform) spins up many short-lived function
// instances in parallel. A plain Map lives inside one instance only — every
// other instance starts with a fresh empty Map, so the old limiter did nothing
// in production. Upstash Redis is a shared, persistent store that all instances
// read from, so limits are actually enforced.
//
// SETUP (one-time, free):
//   1. Go to upstash.com → create a Redis database → copy the REST URL & token.
//   2. Add to your Vercel env vars:
//        UPSTASH_REDIS_REST_URL   = https://...upstash.io
//        UPSTASH_REDIS_REST_TOKEN = AXxx...
//   3. Run:  npm install @upstash/redis @upstash/ratelimit
//
// The sliding-window algorithm below allows MAX_REQUESTS per IP per
// RATE_LIMIT_WINDOW seconds, smoothly — no burst at window boundaries.

import { Redis } from "@upstash/redis/cloudflare";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"), // 100 requests per 60 seconds
  analytics: false,
  prefix: "rl:api",
});

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // FIX: Added Content-Security-Policy header.
  // This is the strongest defence against XSS — it tells browsers which
  // sources are allowed to load scripts, styles, images, etc.
  // 'unsafe-inline' is needed for Next.js inline styles/scripts; tighten
  // further (use nonces) once you know your exact asset origins.
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed by Next.js dev; remove in prod if possible
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

export async function middleware(request: NextRequest) {
  // Get the real client IP. Vercel sets x-forwarded-for; fall back to cf-connecting-ip.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          ...SECURITY_HEADERS,
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const response = NextResponse.next();

  // Apply all security headers to every API response
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Expose rate-limit info to callers (optional but helpful for clients)
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", reset.toString());

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
