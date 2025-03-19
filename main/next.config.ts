import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_IMAGE_ALLOWED_PROTOCOL as 'http' | 'https'  || 'http',
        hostname: process.env.NEXT_PUBLIC_IMAGE_ALLOWED_HOSTNAME  ||'localhost',
        port:process.env.NEXT_PUBLIC_IMAGE_ALLOWED_PORT ||  '3001'
      },
    ],
    domains: [process.env.NEXT_PUBLIC_IMAGE_ALLOWED_HOSTNAME  ||'localhost']
  }
};

export default nextConfig;
