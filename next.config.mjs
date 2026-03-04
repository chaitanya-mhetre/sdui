/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable Turbopack file-system cache in dev to avoid "Another write batch or compaction is already active" errors
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
}

export default nextConfig
