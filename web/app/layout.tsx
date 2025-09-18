/**
 * Root Layout - Application Shell and Provider Setup
 *
 * This is the main layout component that wraps the entire application.
 * It sets up the essential providers and global configurations:
 *
 * - ClerkProvider: Authentication and user management
 * - TRPCProvider: Type-safe API client for server communication
 * - Global CSS styles and font configuration
 * - SEO metadata for the application
 *
 * The layout ensures all pages have access to authentication
 * and API functionality through React context providers.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@/components/providers/clerk-provider";
import { TRPCProvider } from "./providers/trpc-provider";
import "./globals.css";

// Configure Inter font for consistent typography
const inter = Inter({ subsets: ["latin"] });

// SEO metadata for the application
export const metadata: Metadata = {
  title: "Consailt - AI-Powered Consulting Platform",
  description:
    "Enterprise consulting project management platform with AI-powered insights and intelligent recommendations",
  icons: {
    icon: "/logos/favicon.svg",
    shortcut: "/logos/favicon.svg",
  },
};

/**
 * Root Layout Component
 *
 * Provides the application shell with essential providers:
 * - Authentication (Clerk)
 * - API client (tRPC)
 * - Global styling and fonts
 *
 * @param children - The page content to render
 * @returns JSX element with provider hierarchy
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
