/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Remove X-Powered-By header for security
  poweredByHeader: false,
  // Compress responses
  compress: true,
  // Logging
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === "development" },
  },
};

module.exports = nextConfig;
