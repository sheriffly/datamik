import './globals.css'
import { JetBrains_Mono } from 'next/font/google'

<head>
  <meta name="google-site-verification" content="google-site-verification=DOTYPEMhnn9mXdgsg6QakJEmwlVB2dDuCts8Gly-vUc" />
</head>

export const metadata = {
  title: 'Datamik',
  description: 'Structured company data platform',

  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png' },
      { rel: 'icon', url: '/android-chrome-512x512.png' },
    ],
  },
}

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={jetbrains.className}>
        {children}
      </body>
    </html>
  )
}
