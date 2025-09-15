import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TRPCProvider } from './providers/trpc-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Consulting Platform',
  description: 'Enterprise consulting project management platform with AI-powered insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  const content = (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Consulting Platform</h1>
            <div className="flex items-center gap-4">
              {clerkPubKey ? (
                <>
                  <SignedOut>
                    <span className="text-gray-600">Please sign in to continue</span>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </>
              ) : (
                <span className="text-gray-500 text-sm">Auth not configured</span>
              )}
            </div>
          </div>
        </header>
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </body>
    </html>
  )

  return clerkPubKey ? (
    <ClerkProvider>
      {content}
    </ClerkProvider>
  ) : content
}
