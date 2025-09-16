'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@consulting-platform/ui'
import { useSidebar } from '@/contexts/sidebar-context'
import {
  LayoutDashboard,
  FolderOpen,
  Brain,
  BookOpen,
  Settings,
  Users,
  BarChart3,
  Menu,
  ChevronLeft
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Insights', href: '/insights', icon: Brain },
  { name: 'Knowledge', href: '/knowledge', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col bg-white shadow-lg transition-all duration-300',
          // Desktop width
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile/tablet visibility
          isMobileOpen ? 'left-0 w-64' : '-left-64 lg:left-0',
          // Always visible on large screens
          'lg:left-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!isCollapsed ? (
            <h1 className="text-xl font-bold text-gray-900">Consulting</h1>
          ) : (
            <span className="text-xl font-bold text-gray-900 hidden lg:block">C</span>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1.5 rounded-md hover:bg-gray-100"
          >
            <ChevronLeft className={cn(
              "h-5 w-5 transition-transform",
              isCollapsed && "rotate-180"
            )} />
          </button>

          {/* Mobile close button */}
          <button
            onClick={toggleMobile}
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'group flex items-center gap-x-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        'h-6 w-6 shrink-0',
                        isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                      )}
                    />
                    <span className={cn(
                      'transition-all',
                      isCollapsed && 'lg:hidden'
                    )}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer info when collapsed */}
        {isCollapsed && (
          <div className="hidden lg:flex items-center justify-center py-4 border-t">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
              CP
            </div>
          </div>
        )}
      </div>
    </>
  )
}