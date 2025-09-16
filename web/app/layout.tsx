import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@/components/providers/clerk-provider'
import { TRPCProvider } from './providers/trpc-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Consailt - AI-Powered Consulting Platform',
  description: 'Enterprise consulting project management platform with AI-powered insights and intelligent recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}