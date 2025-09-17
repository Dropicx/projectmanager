"use client";

import { cn } from "@consulting-platform/ui";
import {
  BarChart3,
  Bell,
  Briefcase,
  ChevronLeft,
  Database,
  Hash,
  LayoutDashboard,
  Menu,
  Newspaper,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/sidebar-context";

const UserButton = dynamic(() => import("@clerk/nextjs").then((mod) => mod.UserButton), {
  ssr: false,
  loading: () => <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />,
});

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Knowledge Base", href: "/knowledge", icon: Database },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "AI Insights", href: "/insights", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={toggleMobile}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "h-screen lg:h-full lg:min-h-screen flex flex-col bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-xl transition-all duration-300 fixed lg:sticky lg:top-0 z-50",
          // Desktop width
          isCollapsed ? "lg:w-20" : "lg:w-72",
          // Mobile/tablet visibility
          isMobileOpen ? "left-0 w-72" : "-left-72 lg:left-0",
          // Always visible on large screens
          "lg:left-0"
        )}
      >
        {/* Header with branding */}
        <div className="flex h-20 items-center justify-between px-4 border-b border-indigo-500/30">
          {!isCollapsed ? (
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white">Consailt</h1>
              <p className="text-xs text-indigo-200">AI-Powered Consulting</p>
            </div>
          ) : (
            <span className="text-2xl font-bold text-white hidden lg:block">C</span>
          )}

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden lg:block p-1.5 rounded-md hover:bg-indigo-500/30 transition-colors"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 text-indigo-200 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={toggleMobile}
            className="lg:hidden p-1.5 rounded-md hover:bg-indigo-500/30"
          >
            <ChevronLeft className="h-5 w-5 text-indigo-200" />
          </button>
        </div>

        {/* Search bar (expanded only) */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-indigo-500/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-300" />
              <input
                type="search"
                placeholder="Search projects..."
                className="w-full pl-10 pr-3 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-sm text-white placeholder-indigo-300 focus:outline-none focus:bg-indigo-500/30 focus:border-indigo-400/50"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-white/20 text-white shadow-md"
                        : "text-indigo-100 hover:text-white hover:bg-indigo-500/20"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-6 w-6 shrink-0",
                        isActive ? "text-white" : "text-indigo-200 group-hover:text-white"
                      )}
                    />
                    <span className={cn("transition-all", isCollapsed && "lg:hidden")}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-indigo-500/30 p-4">
          <div className={cn("flex items-center", isCollapsed ? "lg:justify-center" : "gap-3")}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonBox: "flex-row-reverse",
                  userButtonTrigger: "focus:outline-none",
                  userButtonAvatarBox: "w-10 h-10",
                  userButtonOuterIdentifier: "text-indigo-100 text-sm font-medium ml-3",
                },
              }}
              showName={!isCollapsed}
              afterSignOutUrl="/"
            />
            {!isCollapsed && (
              <button
                type="button"
                className="ml-auto p-2 rounded-lg hover:bg-indigo-500/30 transition-colors"
              >
                <Bell className="h-5 w-5 text-indigo-200" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
