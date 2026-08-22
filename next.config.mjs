/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // The two stylesheets blocked rendering for ~750ms, and the LCP breakdown
    // was almost entirely "element render delay" waiting on them. Inlining puts
    // ~21KB into each HTML response but removes a round trip from the critical
    // path: measured FCP/LCP 1064ms -> 508ms on a throttled mobile profile.
    inlineCss: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Cloudflare Pages can't run Next's image optimizer (it just passes the
    // original through and costs a function call). Serve images as static CDN
    // assets instead — sources are already compressed/sized at build time.
    unoptimized: true,
  },
}

export default nextConfig
