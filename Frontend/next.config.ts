import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        /**
         * When you call fetch('/api/...') in your code, 
         * Next.js will proxy it to your local FastAPI server.
         */
        source: '/api/:path*',
        destination: "http://127.0.0.1:8000/api/:path*",     
      
      },
    ];
  },
};

export default nextConfig;