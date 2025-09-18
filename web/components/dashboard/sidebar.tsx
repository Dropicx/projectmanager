"use client";

import { cn } from "@consulting-platform/ui";
import {
  BarChart3,
  Bell,
  Briefcase,
  ChevronLeft,
  Database,
  LayoutDashboard,
  Menu,
  Newspaper,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  // Desktop: always collapsed unless hovered
  const isCollapsed = !isHovered;
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
      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "h-screen lg:h-full lg:min-h-screen flex flex-col bg-[#0E7C7B] text-white shadow-xl transition-all duration-300 fixed lg:sticky lg:top-0 z-50",
          // Desktop width - always starts collapsed, expands on hover
          isCollapsed ? "lg:w-20" : "lg:w-72",
          // Mobile/tablet visibility
          isMobileOpen ? "left-0 w-72" : "-left-72 lg:left-0",
          // Always visible on large screens
          "lg:left-0"
        )}
      >
        {/* Header with branding */}
        <div className="flex h-20 items-center justify-between px-4 border-b border-white/10">
          {!isCollapsed ? (
            <div className="flex items-center">
              <Image
                src="/logos/biglogo.png"
                alt="Consailt Logo"
                width={220}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="mx-auto">
              <Image
                src="/logos/smalllogo.png"
                alt="Consailt Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* Mobile close button */}
          <button
            type="button"
            onClick={toggleMobile}
            className="lg:hidden p-1.5 rounded-md hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5 text-white/80" />
          </button>
        </div>

        {/* Search bar or icon */}
        <div className="px-4 py-3 border-b border-white/10">
          {!isCollapsed ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="search"
                placeholder="Search projects..."
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/30"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsHovered(true)}
              className="w-full flex justify-center items-center py-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Search"
            >
              <Search className="h-5 w-5 text-white/60" />
            </button>
          )}
        </div>

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
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-6 w-6 shrink-0",
                        isActive ? "text-white" : "text-white/70 group-hover:text-white"
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
        <div className="border-t border-white/10 p-4">
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
                className="ml-auto p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Bell className="h-5 w-5 text-white/70" />
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
