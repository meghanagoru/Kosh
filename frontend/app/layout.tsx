import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { KoshyaStoreProvider } from '@/context/KoshyaStoreContext'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KOSHYA — Personal Inflation Intelligence',
  description:
    'Your personal inflation intelligence engine. Compare government CPI against your real spending basket, uncover hidden costs, and recover value with data-driven insights.',
  keywords: ['inflation', 'personal finance', 'India CPI', 'MOSPI', 'budget analysis', 'pink tax'],
  openGraph: {
    title: 'KOSHYA — Personal Inflation Intelligence',
    description: 'Your real inflation rate, not the government\'s.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}
        suppressHydrationWarning
      >
        <KoshyaStoreProvider>{children}</KoshyaStoreProvider>
      </body>
    </html>
  )
}
