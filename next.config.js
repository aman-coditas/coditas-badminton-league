/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coditas-brand-assets.web.app",
        pathname: "/logos/**",
      },
    ],
  },
};

module.exports = nextConfig;