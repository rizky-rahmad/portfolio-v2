/** @type {import('next').NextConfig} */
const nextConfig = {
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
