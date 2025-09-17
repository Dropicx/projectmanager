"use client";

import { cn } from "@consulting-platform/ui";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 transition-all duration-300">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
