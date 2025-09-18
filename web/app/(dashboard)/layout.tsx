"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { Button, cn } from "@consulting-platform/ui";
import { Loader2 } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-tekhelet-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h1>
            <p className="text-gray-600">
              Please sign in to access your dashboard and start consailing with AI.
            </p>
          </div>
          <SignInButton mode="modal">
            <Button className="w-full bg-tekhelet-500 hover:bg-tekhelet-600 text-white">
              Sign In to Dashboard
            </Button>
          </SignInButton>
        </div>
      </div>
    );
  }

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
