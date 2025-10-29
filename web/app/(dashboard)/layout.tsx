"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { FroxDashboardHeader } from "@/components/dashboard/frox-dashboard-header";
import { FroxDashboardSidebar } from "@/components/dashboard/frox-dashboard-sidebar";
import { GlobalButton } from "@/components/GlobalButton";
import { SidebarProvider } from "@/contexts/sidebar-context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-neutral-bg">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-color-brands" />
          <p className="text-gray-600 dark:text-gray-dark-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-neutral-bg">
        <div className="max-w-md w-full bg-white dark:bg-dark-neutral-bg rounded-2xl shadow-lg p-8 text-center border border-neutral dark:border-dark-neutral-border">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-dark-900 mb-2">
              Access Required
            </h1>
            <p className="text-gray-600 dark:text-gray-dark-600">
              Please sign in to access your dashboard and start consailing with AI.
            </p>
          </div>
          <SignInButton mode="modal">
            <GlobalButton className="w-full" variant="primary">
              Sign In to Dashboard
            </GlobalButton>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-neutral-bg">
      <FroxDashboardSidebar />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <FroxDashboardHeader />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
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
