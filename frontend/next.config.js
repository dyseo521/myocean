/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 외부 스크립트 허용 (카카오맵)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
    ]
  },

  // 이미지 도메인 허용 (필요시 추가)
  images: {
    domains: [],
  },

  // Webpack 설정 (필요시)
  webpack: (config) => {
    return config;
  },
}

module.exports = nextConfig
