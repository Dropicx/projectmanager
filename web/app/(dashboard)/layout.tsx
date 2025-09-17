"use client";

import { cn } from "@consulting-platform/ui";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="h-screen flex bg-gray-50">
      <DashboardSidebar />
      <div
        className={cn(
          "flex-1 transition-all duration-300 overflow-hidden",
          // Desktop padding
          isCollapsed ? "lg:ml-20" : "lg:ml-72",
          // Mobile padding
          "ml-0"
        )}
      >
        <main className="h-full overflow-auto">
          {children}
        </main>
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
