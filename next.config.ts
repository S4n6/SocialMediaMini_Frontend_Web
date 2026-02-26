import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "buffer.com",
      "bit.ly",
      "picsum.photos",
      "images.unsplash.com",
      "randomuser.me",
      "media.vov.vn",
      "encrypted-tbn3.gstatic.com",
    ],
  },
};

export default nextConfig;
