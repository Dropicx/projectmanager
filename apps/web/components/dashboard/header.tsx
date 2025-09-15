'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell, Search } from 'lucide-react'
import { Button } from '@consulting-platform/ui'

export function DashboardHeader() {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" />
          <input
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Search projects, tasks, or knowledge..."
            type="search"
            name="search"
          />
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  )
}
