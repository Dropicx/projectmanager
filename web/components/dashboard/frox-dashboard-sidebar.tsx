"use client";

import {
  FroxSidebar,
  type FroxSidebarCategory,
  type FroxSidebarMenuItem,
} from "@consulting-platform/ui";
import {
  BarChart3,
  Briefcase,
  Database,
  LayoutDashboard,
  Newspaper,
  Settings,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSidebar } from "@/contexts/sidebar-context";

export function FroxDashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Menu items configuration
  const menuItems: FroxSidebarMenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "knowledge",
      label: "Knowledge Base",
      icon: Database,
      href: "/knowledge",
    },
    {
      id: "projects",
      label: "Projects",
      icon: Briefcase,
      href: "/projects",
    },
    {
      id: "news",
      label: "News",
      icon: Newspaper,
      href: "/news",
      badge: {
        count: 3,
        color: "pink",
      },
    },
    {
      id: "insights",
      label: "AI Insights",
      icon: Sparkles,
      href: "/insights",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
  ];

  // Secondary menu items (shown after separator)
  const secondaryMenuItems: FroxSidebarMenuItem[] = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  // Categories configuration
  const categories: FroxSidebarCategory[] = [
    { id: "tech", label: "Technology", count: 15 },
    { id: "business", label: "Business", count: 8 },
    { id: "security", label: "Security", count: 12 },
    { id: "cloud", label: "Cloud", count: 20 },
  ];

  const handleMenuItemClick = (item: FroxSidebarMenuItem) => {
    if (item.href) {
      router.push(item.href);
    }
    // Close mobile menu after navigation
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close mobile menu"
        />
      )}

      {/* Sidebar */}
      <FroxSidebar
        logo={
          <Image
            src="/logos/biglogo.png"
            alt="Consailt Logo"
            width={200}
            height={70}
            className="object-contain"
            priority
          />
        }
        logoCollapsed={
          <Image
            src="/logos/smalllogo.png"
            alt="Consailt Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        }
        menuItems={menuItems}
        secondaryMenuItems={secondaryMenuItems}
        categories={categories}
        showCategories={true}
        showUpgradeCard={false}
        showDarkModeToggle={true}
        collapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
        activePath={pathname}
        onMenuItemClick={handleMenuItemClick}
        className={`
          fixed lg:relative z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:flex
        `}
      />
    </>
  );
}
