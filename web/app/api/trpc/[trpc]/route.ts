import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'
import { appRouter } from '@consulting-platform/api'
import { createContext } from '@consulting-platform/api/trpc/trpc'
import { auth } from '@clerk/nextjs/server'

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const { userId } = await auth()
      
      return {
        ...createContext(),
        user: userId ? {
          id: userId,
          email: '', // This would be fetched from Clerk
          organizationId: '' // This would be fetched from user metadata
        } : undefined
      }
    },
  })

export { handler as GET, handler as POST }
