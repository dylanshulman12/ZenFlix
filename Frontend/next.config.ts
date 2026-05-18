

/** @type {import('next').NextConfig} */
const nextConfig = {

  async rewrites() {

    // ONLY during development
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:8000/api/:path*",
        },
      ];
    }

    // production: no rewrites
    return [];
  },

};

module.exports = nextConfig;


export default nextConfig;
