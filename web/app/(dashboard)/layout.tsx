'use client'

import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@consulting-platform/ui'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className={cn(
        "transition-all duration-300",
        // Desktop padding
        isCollapsed ? "lg:pl-20" : "lg:pl-72",
        // Mobile padding
        "pl-0"
      )}>
        <main className="min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}