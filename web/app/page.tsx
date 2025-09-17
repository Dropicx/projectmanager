/**
 * Home Page - Landing Page and Authentication Gateway
 * 
 * This is the main landing page that serves as the entry point for the application.
 * It provides:
 * 
 * - Marketing content showcasing platform features
 * - Authentication buttons for sign-in and sign-up
 * - Automatic redirection for authenticated users
 * - Feature highlights and value propositions
 * 
 * The page uses Clerk for authentication and automatically redirects
 * authenticated users to the dashboard to avoid showing the landing page
 * to users who are already logged in.
 */

"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Home Page Component
 * 
 * Renders the landing page with marketing content and authentication options.
 * Automatically redirects authenticated users to the dashboard.
 * 
 * @returns JSX element representing the landing page
 */
export default function HomePage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Consailt
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered consulting platform that transforms how teams manage projects, gain insights,
            and collaborate with intelligent recommendations.
          </p>

          {/* Authentication Buttons */}
          <div className="flex gap-4 justify-center">
            <SignInButton mode="modal">
              <Button size="lg">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline" size="lg">
                Get Started
              </Button>
            </SignUpButton>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">AI-Powered Insights</h3>
            <p className="text-gray-600">
              Get intelligent project analysis, risk assessment, and recommendations powered by
              multiple AI models including Claude, Nova, and Mistral.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Knowledge Management</h3>
            <p className="text-gray-600">
              Build and search your knowledge base with RAG capabilities, making institutional
              knowledge easily accessible and actionable.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Real-time Collaboration</h3>
            <p className="text-gray-600">
              Work together seamlessly with real-time updates, notifications, and collaborative
              project management tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
