import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disable the params promise warning
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  onError: (error: Error) => {
    // Suppress or handle errors here
    console.error(error);
    return;
  },
  reactStrictMode: true,
};

export default nextConfig;
