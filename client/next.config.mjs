/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["socket.io-client"],
  },
};

export default nextConfig;
