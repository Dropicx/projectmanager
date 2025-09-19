"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const _router = useRouter();

  // Handle authentication errors
  const _handleError = (error: any) => {
    console.error("Clerk authentication error:", error);

    // Handle rate limiting specifically
    if (error?.status === 429) {
      console.warn("Rate limit exceeded. Please wait a moment before retrying.");
      // You could show a toast notification here
      // Optionally redirect to an error page
      // router.push('/auth-error?reason=rate-limit');
    }
  };

  return (
    <BaseClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none",
        },
      }}
      // Polling interval for session checks (increase to reduce requests)
      polling={false}
      // Additional configuration to prevent excessive requests
      sdkMetadata={{
        name: "consulting-platform",
        version: "1.0.0",
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}
