import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiter is optional — only initialised when Upstash env vars are present.
// Without them the middleware still applies security headers but skips rate limiting.
let ratelimit: import("@upstash/ratelimit").Ratelimit | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  const { Redis }     = require("@upstash/redis/cloudflare");
  const { Ratelimit } = require("@upstash/ratelimit");
  ratelimit = new Ratelimit({
    redis: new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter:   Ratelimit.slidingWindow(100, "60 s"),
    analytics: false,
    prefix:    "rl:api",
  });
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options":        "DENY",
  "X-XSS-Protection":       "1; mode=block",
  "Referrer-Policy":        "strict-origin-when-cross-origin",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Allow same-origin + Google OAuth + NextAuth callbacks
    "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://openidconnect.googleapis.com",
    "frame-ancestors 'none'",
  ].join("; "),
};

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  // Only rate-limit when Upstash is configured
  if (ratelimit) {
    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              ...SECURITY_HEADERS,
              "X-RateLimit-Limit":     limit.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset":     reset.toString(),
              "Retry-After":           Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }
    } catch {
      // If Redis is unreachable, fail open (don't block legitimate traffic)
    }
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    // Rate-limit & secure all API routes EXCEPT NextAuth's own endpoints.
    // NextAuth makes multiple internal sub-requests; rate-limiting them breaks
    // sign-in, sign-out, and session refresh.
    "/api/((?!auth/).*)",
  ],
};
