"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-200/40 via-white via-tekhelet-200/30 via-maize-200/35 via-satinSheenGold-200/30 to-coolGray-200/40">
      {/* Main Section with integrated header */}
      <section className="relative min-h-screen px-6 pt-8 pb-20 lg:pt-12 lg:pb-32 overflow-hidden">
        {/* Animated floating elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-teal-400/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-tekhelet-400/35 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-maize-400/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-satinSheenGold-400/25 rounded-full blur-3xl animate-pulse delay-1500"></div>
        <div className="absolute top-1/4 left-1/2 w-56 h-56 bg-coolGray-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-88 h-88 bg-tekhelet-300/30 rounded-full blur-3xl animate-pulse delay-3000"></div>

        {/* Flowing background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-tekhelet-200/30 via-transparent to-maize-200/40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-teal-200/20 via-transparent to-satinSheenGold-200/25"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Integrated Navigation */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/logos/biglogo.png"
                  alt="Consailt Logo"
                  width={1200}
                  height={360}
                  className="h-48 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-black hover:text-tekhelet-500 hover:bg-tekhelet-50 font-medium px-6 py-3 text-base"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white px-6 py-3 text-base"
                >
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </nav>

          {/* Page Content Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 mb-20 shadow-2xl">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                <span className="bg-gradient-to-r from-tekhelet-500 via-teal-500 to-maize-500 bg-clip-text text-transparent">
                  Cookie Policy
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Learn about how we use cookies and similar technologies to enhance your experience.
              </p>
              <p className="text-sm text-gray-600 mt-4">Last updated: January 1, 2025</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              {/* What are Cookies */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">What are Cookies?</h2>
                <p className="text-gray-600 leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit our
                  website. They help us provide you with a better experience by remembering your
                  preferences and enabling certain functionality.
                </p>
              </div>

              {/* Types of Cookies */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Types of Cookies We Use</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Essential Cookies</h3>
                    <p className="text-gray-600 mb-2">
                      These cookies are necessary for the website to function properly and cannot be
                      disabled.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Authentication and security</li>
                      <li>Load balancing and performance</li>
                      <li>User session management</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Analytics Cookies</h3>
                    <p className="text-gray-600 mb-2">
                      These cookies help us understand how visitors interact with our website.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Page views and user behavior</li>
                      <li>Performance monitoring</li>
                      <li>Error tracking and debugging</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Preference Cookies</h3>
                    <p className="text-gray-600 mb-2">
                      These cookies remember your choices and preferences.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Language and region settings</li>
                      <li>Theme and display preferences</li>
                      <li>Customized content delivery</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Managing Cookies */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">
                  Managing Your Cookie Preferences
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You can control and manage cookies in several ways:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Use our cookie preference center (available in your account settings)</li>
                  <li>Configure your browser settings to block or delete cookies</li>
                  <li>Use browser extensions that manage cookies</li>
                  <li>Opt-out of specific tracking technologies</li>
                </ul>
              </div>

              {/* Third Party Cookies */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Third-Party Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may use third-party services that set their own cookies:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Google Analytics for website analytics</li>
                  <li>Authentication providers (Clerk) for user management</li>
                  <li>AI service providers for processing queries</li>
                  <li>CDN providers for content delivery</li>
                </ul>
              </div>

              {/* Contact Information */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about our use of cookies, please contact us:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p>Email: privacy@consailt.com</p>
                  <p>Phone: +1 (555) 123-4567</p>
                  <p>Address: 123 Consulting Street, San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Content Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <Link href="/">
                  <Image
                    src="/logos/logofooter.png"
                    alt="Consailt Logo"
                    width={320}
                    height={96}
                    className="h-20 w-auto"
                  />
                </Link>
              </div>
              <div className="text-gray-500 text-sm">© 2025 Consailt. All rights reserved.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
