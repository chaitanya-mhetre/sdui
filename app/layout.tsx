import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ["latin"], weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://sdui.in'),
  title: {
    default: 'SDUI | The Ultimate Server-Driven UI Platform',
    template: '%s | SDUI'
  },
  description: 'Build and deploy native mobile UIs at scale without app store updates. SDUI is the industrial-grade server-driven UI engine for Flutter and React Native.',
  keywords: ['SDUI', 'Server-Driven UI', 'Dynamic UI', 'Mobile Development', 'Flutter SDUI', 'React Native SDUI', 'Low Code Mobile', 'UI Orchestration'],
  authors: [{ name: 'SDUI Team' }],
  creator: 'SDUI Team',
  publisher: 'SDUI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SDUI | Build UIs at scale',
    description: 'The ultimate server-driven UI platform for modern mobile applications. Orchestrate native layouts with surgical precision.',
    url: 'https://sdui.in',
    siteName: 'SDUI',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'SDUI Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SDUI | Build native UIs at scale',
    description: 'Industrial-grade server-driven UI engine for high-scale mobile distribution.',
    images: ['/logo.png'],
    creator: '@sdui_in',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'w_DiS7xY5j5Q6fBhK-f2QQ8-1Cpk-b1VVPLHPAdnd7s',
  },
  icons: {
    icon: [
      {
        url: '/sd.png',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'SDUI',
  'description': 'Industrial-grade server-driven UI platform for mobile applications.',
  'applicationCategory': 'DeveloperApplication',
  'operatingSystem': 'Android, iOS',
  'url': 'https://sdui.in',
  'author': {
    '@type': 'Organization',
    'name': 'SDUI',
    'url': 'https://sdui.in'
  },
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'USD'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
