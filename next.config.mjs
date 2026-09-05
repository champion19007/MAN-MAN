/**
 * Every host listed here can be proxied through the image optimizer at your
 * own bandwidth and billing, so keep this list to hosts you actually serve
 * pages from. Add your CDN (R2/S3/CloudFront) here and drop `picsum.photos`
 * once real assets replace the seed placeholders.
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
    remotePatterns: [
      // Seed/demo artwork only.
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/seed/**' },
      // Local asset server during development.
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
