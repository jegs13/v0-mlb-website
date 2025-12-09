/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.espn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s.espncdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.espncdn.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
