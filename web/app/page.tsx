/**
 * Home Page - Modern Landing Page for Consailt
 *
 * A comprehensive marketing landing page showcasing Consailt's AI-powered
 * consulting platform with modern design, compelling copy, and clear CTAs.
 */

"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GlobalButton } from "@/components/GlobalButton";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/background/gradient01.jpg')",
      }}
    >
      {/* Main Section with integrated header */}
      <section className="relative min-h-screen px-6 pt-8 pb-20 lg:pt-12 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Integrated Navigation */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center">
              <Image
                src="/logos/biglogo.png"
                alt="Consailt Logo"
                width={1200}
                height={360}
                className="h-48 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:text-tekhelet-200 hover:bg-tekhelet-50 font-medium px-6 py-3 text-base"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <GlobalButton size="md" variant="primary">
                  Get Started
                </GlobalButton>
              </SignUpButton>
            </div>
          </nav>

          {/* Hero Content Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 mb-20 shadow-2xl">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-tekhelet-100/80 text-tekhelet-700 text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-tekhelet-500 rounded-full mr-2 animate-pulse"></span>
                Sailing to Success with AI
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                <span className="bg-gradient-to-r from-tekhelet-500 via-tekhelet-400 to-maize-500 bg-clip-text text-transparent">
                  Sail Through Projects
                </span>
                <br />
                <span className="text-black">with the Wind of AI</span>
              </h1>

              <p className="text-xl md:text-2xl text-black mb-12 max-w-4xl mx-auto leading-relaxed">
                Stop juggling Google, ChatGPT, news feeds, and security alerts. Join the new
                generation of <span className="font-semibold text-tekhelet-600">consailors</span> —
                consultants who have everything in one unified platform. Knowledge base, project
                planning, risk analysis, and AI-powered insights all sailing together toward project
                success.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <SignUpButton mode="modal">
                  <GlobalButton size="lg" variant="primary">
                    Start Free Trial
                  </GlobalButton>
                </SignUpButton>
                <GlobalButton size="lg" variant="secondary">
                  Watch Demo
                </GlobalButton>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-black text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-tekhelet-500 rounded-full mr-2"></div>
                  Smooth Sailing Guaranteed
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-tekhelet-500 rounded-full mr-2"></div>
                  AI-Powered Navigation
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-tekhelet-500 rounded-full mr-2"></div>
                  Enterprise-Grade Compass
                </div>
              </div>
            </div>
          </div>

          {/* Problem/Solution Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 mb-20 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                From Chaos to Smooth Sailing
              </h2>
              <p className="text-xl text-black max-w-4xl mx-auto mb-12">
                Tired of juggling multiple tools? Consailt brings everything together in one unified
                platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Problem Side */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-red-600 mb-6">The Old Way (Chaos)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <div>
                      <p className="font-semibold text-black">Scattered Tools</p>
                      <p className="text-gray-600 text-sm">
                        Google, ChatGPT, news feeds, security alerts—all separate
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <div>
                      <p className="font-semibold text-black">Context Switching</p>
                      <p className="text-gray-600 text-sm">
                        Constantly jumping between platforms, losing focus
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <div>
                      <p className="font-semibold text-black">Knowledge Silos</p>
                      <p className="text-gray-600 text-sm">
                        Information scattered across different systems
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <div>
                      <p className="font-semibold text-black">Manual Work</p>
                      <p className="text-gray-600 text-sm">Time-consuming research and analysis</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solution Side */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-tekhelet-600 mb-6">
                  The Consailt Way (Smooth Sailing)
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-black">Unified Platform</p>
                      <p className="text-gray-600 text-sm">
                        Everything in one place—knowledge, AI, news, security
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-black">AI-Powered Integration</p>
                      <p className="text-gray-600 text-sm">
                        Intelligent connections between all your tools
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-black">Centralized Knowledge</p>
                      <p className="text-gray-600 text-sm">
                        One searchable knowledge base for everything
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-black">Automated Intelligence</p>
                      <p className="text-gray-600 text-sm">
                        AI handles research, analysis, and insights
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-tekhelet-500 to-tekhelet-400 rounded-full text-white font-semibold">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-label="Checkmark"
                >
                  <title>Checkmark</title>
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                One Platform. All Tools. Smooth Sailing.
              </div>
            </div>
          </div>

          {/* Features Content Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 mb-20 shadow-2xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Your AI Navigation System
              </h2>
              <p className="text-xl text-black max-w-3xl mx-auto">
                Equip your consulting vessel with cutting-edge AI tools that chart the course to
                project success. Navigate complex challenges with confidence and precision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Add staggered animation classes */}
              {/* AI Orchestration */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="w-12 h-12 bg-gradient-to-r from-tekhelet-500 to-tekhelet-400 rounded-lg flex items-center justify-center mb-6">
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
                  <span className="px-3 py-1 bg-tekhelet-100 text-tekhelet-700 rounded-full text-sm">
                    Claude 3.7
                  </span>
                  <span className="px-3 py-1 bg-tekhelet-100 text-tekhelet-700 rounded-full text-sm">
                    Nova Pro
                  </span>
                  <span className="px-3 py-1 bg-tekhelet-100 text-tekhelet-700 rounded-full text-sm">
                    Mistral Large
                  </span>
                </div>
              </div>

              {/* Knowledge Management */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="w-12 h-12 bg-gradient-to-r from-tekhelet-500 to-maize-500 rounded-lg flex items-center justify-center mb-6">
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

              {/* Privacy & Security */}
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

              {/* Real-time Insights */}
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

              {/* Collaboration */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="w-12 h-12 bg-gradient-to-r from-tekhelet-500 to-satinSheenGold-500 rounded-lg flex items-center justify-center mb-6">
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
          </div>

          {/* Stats Content Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 mb-20 shadow-2xl">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Trusted by Consailors Worldwide
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
                Join thousands of consailors who have charted new courses to success with AI-powered
                project navigation
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-tekhelet-500 mb-2">80%</div>
                  <div className="text-gray-600">Faster Course Navigation</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-tekhelet-500 mb-2">70%</div>
                  <div className="text-gray-600">Smoother Sailing</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-tekhelet-500 mb-2">90%</div>
                  <div className="text-gray-600">Reduced Project Storms</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-tekhelet-500 mb-2">100%</div>
                  <div className="text-gray-600">Safe Harbor Guaranteed</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Content Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 mb-20 shadow-2xl">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Ready to Set Sail with AI?
              </h2>
              <p className="text-xl text-black mb-12">
                Stop juggling multiple tools and start consailing with confidence. One platform, all
                your needs, smooth sailing ahead. Start your free trial today - no credit card
                required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <SignUpButton mode="modal">
                  <GlobalButton size="xl" variant="primary">
                    Set Sail Now
                  </GlobalButton>
                </SignUpButton>
                <GlobalButton size="xl" variant="secondary">
                  Schedule Demo
                </GlobalButton>
              </div>

              <div className="text-sm text-black">
                <p>✓ 14-day free voyage • ✓ No setup fees • ✓ Cancel anytime</p>
              </div>
            </div>
          </div>

          {/* Footer Content Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Company Info */}
              <div className="md:col-span-1">
                <div className="flex items-center mb-4">
                  <Image
                    src="/logos/logofooter.png"
                    alt="Consailt Logo"
                    width={320}
                    height={96}
                    className="h-16 w-auto"
                  />
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  The AI-powered navigation system for consailors—sailing through projects with the
                  wind of artificial intelligence.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://twitter.com/consailt"
                    className="text-gray-400 hover:text-tekhelet-500 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Twitter"
                    >
                      <title>Twitter</title>
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com/company/consailt"
                    className="text-gray-400 hover:text-tekhelet-500 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="LinkedIn"
                    >
                      <title>LinkedIn</title>
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://pinterest.com/consailt"
                    className="text-gray-400 hover:text-tekhelet-500 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Pinterest"
                    >
                      <title>Pinterest</title>
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Product */}
              <div>
                <h3 className="text-black font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/features"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="/pricing"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="/api"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      API
                    </a>
                  </li>
                  <li>
                    <a
                      href="/integrations"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Integrations
                    </a>
                  </li>
                  <li>
                    <a
                      href="/changelog"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Changelog
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-black font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/about"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="/blog"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="/careers"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Careers
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="/partners"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Partners
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-black font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/privacy"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terms"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a
                      href="/cookies"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/gdpr"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      GDPR
                    </a>
                  </li>
                  <li>
                    <a
                      href="/security"
                      className="text-gray-600 hover:text-tekhelet-500 transition-colors"
                    >
                      Security
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-gray-500 text-sm mb-2 md:mb-0">
                  © 2025 Consailt. All rights reserved.
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>Made with ❤️ for consailors</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Smooth sailing ahead</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
