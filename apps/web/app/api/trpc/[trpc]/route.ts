import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'
import { appRouter } from '@consulting-platform/api'
import { db } from '@consulting-platform/database'
import { AIOrchestrator } from '@consulting-platform/ai'
import { auth } from '@clerk/nextjs'

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const { userId } = await auth()
      
      return {
        user: userId ? {
          id: userId,
          email: '', // This would be fetched from Clerk
          organizationId: '' // This would be fetched from user metadata
        } : undefined,
        db,
        ai: new AIOrchestrator()
      }
    },
  })

export { handler as GET, handler as POST }
