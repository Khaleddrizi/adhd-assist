/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const apiUrl = (
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5004"
    ).replace(/\/$/, "")
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }]
  },
}

export default nextConfig
