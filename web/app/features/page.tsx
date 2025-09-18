"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";

export default function FeaturesPage() {
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
                  Features
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Discover all the powerful features that make Consailt the ultimate platform for
                consailors. Everything you need to navigate projects with confidence.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AI Wind Selection */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="w-12 h-12 bg-gradient-to-r from-tekhelet-500 to-teal-500 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="AI Brain Icon"
                  >
                    <title>AI Brain Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">AI Wind Selection</h3>
                <p className="text-black mb-4">
                  Smart routing across Claude, Nova, Mistral, and Llama models—choosing the perfect
                  wind for every consulting voyage.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                    Claude 3.7
                  </span>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                    Nova Pro
                  </span>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                    Mistral Large
                  </span>
                </div>
              </div>

              {/* All-in-One Command Center */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-maize-500 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Knowledge Base Icon"
                  >
                    <title>Knowledge Base Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">All-in-One Command Center</h3>
                <p className="text-black mb-4">
                  Replace Google, ChatGPT, news feeds, and security alerts with one unified
                  platform. Everything you need to consail projects successfully.
                </p>
                <ul className="text-sm text-black space-y-1">
                  <li>• Integrated AI chat (replaces ChatGPT)</li>
                  <li>• Smart search (replaces Google)</li>
                  <li>• News and security monitoring</li>
                  <li>• Project planning and risk analysis</li>
                </ul>
              </div>

              {/* Secure Harbor */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="w-12 h-12 bg-gradient-to-r from-maize-500 to-satinSheenGold-500 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Security Lock Icon"
                  >
                    <title>Security Lock Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Secure Harbor</h3>
                <p className="text-black mb-4">
                  Your data stays in safe waters with zero-retention AI, client sanitization, and
                  enterprise-grade security protocols.
                </p>
                <ul className="text-sm text-black space-y-1">
                  <li>• Zero-data retention AI</li>
                  <li>• Client sanitization</li>
                  <li>• GDPR and SOC2 compliant</li>
                </ul>
              </div>

              {/* Automated Insights */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="w-12 h-12 bg-gradient-to-r from-satinSheenGold-500 to-tekhelet-500 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Analytics Chart Icon"
                  >
                    <title>Analytics Chart Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Automated Insights</h3>
                <p className="text-black mb-4">
                  AI-generated insights, pattern recognition, and trend analysis across your
                  knowledge base.
                </p>
                <ul className="text-sm text-black space-y-1">
                  <li>• Pattern recognition</li>
                  <li>• Trend analysis</li>
                  <li>• Predictive insights</li>
                </ul>
              </div>

              {/* Cost Optimization */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="w-12 h-12 bg-gradient-to-r from-tekhelet-500 to-maize-500 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Dollar Cost Icon"
                  >
                    <title>Dollar Cost Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Cost Optimized</h3>
                <p className="text-black mb-4">
                  Smart routing to minimize AI costs while maintaining quality with usage tracking.
                </p>
                <ul className="text-sm text-black space-y-1">
                  <li>• Under $0.001 per query average</li>
                  <li>• Usage monitoring</li>
                  <li>• Cost alerts</li>
                </ul>
              </div>

              {/* Team Collaboration */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-satinSheenGold-500 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Team Collaboration Icon"
                  >
                    <title>Team Collaboration Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Team Collaboration</h3>
                <p className="text-black mb-4">
                  Real-time collaboration with shared knowledge bases and team insights.
                </p>
                <ul className="text-sm text-black space-y-1">
                  <li>• Shared knowledge bases</li>
                  <li>• Real-time updates</li>
                  <li>• Team analytics</li>
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Ready to Experience These Features?
              </h2>
              <p className="text-lg text-black mb-8">
                Start your free trial and discover how these features can transform your consulting
                practice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white px-8 py-4 text-lg"
                  >
                    Start Free Trial
                  </Button>
                </SignUpButton>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-tekhelet-500 text-tekhelet-500 hover:bg-tekhelet-50 px-8 py-4 text-lg"
                  >
                    View Pricing
                  </Button>
                </Link>
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
