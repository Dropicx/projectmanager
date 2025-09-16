'use client'

import { createTRPCReact } from '@trpc/react-query'
import { type AppRouter } from '@consulting-platform/api/trpc/root'

export const api = createTRPCReact<AppRouter>()