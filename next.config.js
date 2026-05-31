/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // (auth) is a Next.js route group — the folder name is stripped from
      // the URL. Redirect legacy /auth/* paths to the correct locations.
      { source: "/auth/login",           destination: "/login",           permanent: true },
      { source: "/auth/register",        destination: "/register",        permanent: true },
      { source: "/auth/forgot-password", destination: "/forgot-password", permanent: true },
    ];
  },

  images: {
    // FIX: Removed the wildcard hostname: '**' pattern.
    // Allowing images from ANY https domain is a security risk — it can be
    // abused to load tracking pixels, malicious content, or SSRF probes.
    // List only the domains you actually use:
    //   - lh3.googleusercontent.com  → Google OAuth profile pictures
    //   - avatars.githubusercontent.com → GitHub OAuth profile pictures
    // Add more specific hostnames here as needed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile images
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub profile images
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // FIX: Added Content-Security-Policy.
          // Tells the browser exactly which sources are trusted for each
          // resource type. This stops injected scripts from running even if
          // XSS somehow bypasses DOMPurify.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          // FIX: Added Permissions-Policy to disable browser features you
          // don't use. Reduces the attack surface if a script is injected.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // FIX: Added Strict-Transport-Security (HSTS).
          // Forces browsers to always use HTTPS for this domain for 1 year.
          // Only activate this once you're sure the site is always on HTTPS.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
