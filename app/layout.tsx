import './globals.css'
import { JetBrains_Mono } from 'next/font/google'

<head>
  <meta name="google-site-verification" content="google-site-verification=DOTYPEMhnn9mXdgsg6QakJEmwlVB2dDuCts8Gly-vUc" />
</head>

export const metadata = {
  title: 'Datamik — Structured Company Data',
  description: 'Explore and manage structured company data in a clean, minimal interface.',
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