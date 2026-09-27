/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  allowedDevOrigins: ['heat-sandy-tartar.ngrok-free.dev', '*.ngrok-free.dev', '*.ngrok.app', 'localhost:3000'],
};

module.exports = nextConfig;
