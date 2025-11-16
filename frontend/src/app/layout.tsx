import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: '마이오션 - 시민이 함께 만드는 깨끗한 바다',
  description: '시민 참여형 유실어구 수거 펀딩 플랫폼',
  keywords: ['마이오션', '유실어구', '해양쓰레기', '크라우드펀딩', '부산'],
  authors: [{ name: '마이오션 팀' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '마이오션',
  },
  icons: {
    icon: '/vite.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0EA5E9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard Font */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
