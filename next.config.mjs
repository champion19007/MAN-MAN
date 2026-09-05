/**
 * Covers and chapter panels are generated into /public, so there is no remote
 * image host and `remotePatterns` is empty. Every host added here can be
 * proxied through the image optimiser at your own bandwidth and billing, so
 * add only hosts you actually serve pages from - your CDN, when artwork moves
 * to object storage.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Covers under /public/covers are SVGs we generate ourselves. The sandbox
    // CSP below is Next's documented guard for serving SVG through the
    // optimizer - it blocks scripts inside any SVG that reaches it.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // No remote hosts: covers and panels are generated into /public, and
    // imported library pages are copied there too. Add your CDN here when real
    // artwork moves to object storage.
    remotePatterns: [],
  },
};

export default nextConfig;
