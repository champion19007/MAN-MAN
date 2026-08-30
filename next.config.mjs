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
    remotePatterns: [
      // Seed/demo artwork only.
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/seed/**' },
      // Local asset server during development.
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
