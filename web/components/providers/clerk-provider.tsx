'use client'

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs'

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  // During build, Clerk keys might not be available
  // Return children without ClerkProvider if keys are missing
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>
  }

  return (
    <BaseClerkProvider>
      {children}
    </BaseClerkProvider>
  )
}