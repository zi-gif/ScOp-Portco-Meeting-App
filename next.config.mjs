/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scopvc.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
