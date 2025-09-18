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
    <div className="min-h-screen bg-gradient-to-b from-teal-100/30 via-white via-tekhelet-100/20 via-maize-100/25 via-satinSheenGold-100/20 to-coolGray-100/30">
      {/* Main Section with integrated header */}
      <section className="relative min-h-screen px-6 py-20 lg:py-32 overflow-hidden">
        {/* Animated floating elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-tekhelet-200/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-maize-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-satinSheenGold-200/15 rounded-full blur-3xl animate-pulse delay-1500"></div>

        {/* Flowing background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-tekhelet-100/20 via-transparent to-maize-100/30"></div>

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
                <Button variant="ghost" className="text-coolGray-600 hover:text-tekhelet-500">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Consulting Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-tekhelet-500 via-teal-500 to-maize-500 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-black">Consulting Practice</span>
            </h1>

            <p className="text-xl md:text-2xl text-black mb-12 max-w-4xl mx-auto leading-relaxed">
              The AI-native knowledge base that captures, organizes, and amplifies your expertise.
              Make institutional knowledge accessible, searchable, and actionable through
              intelligent automation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white px-8 py-4 text-lg"
                >
                  Start Free Trial
                </Button>
              </SignUpButton>
              <Button
                variant="outline"
                size="lg"
                className="border-tekhelet-500 text-tekhelet-500 hover:bg-tekhelet-50 px-8 py-4 text-lg"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-black text-sm mb-20">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                Zero-Data Retention
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                GDPR Compliant
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                Enterprise Security
              </div>
            </div>
          </div>

          {/* Features Content */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              AI-Powered Intelligence
            </h2>
            <p className="text-xl text-black max-w-3xl mx-auto">
              Harness the power of multiple AI models to transform how you capture, organize, and
              leverage knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Add staggered animation classes */}
            {/* AI Orchestration */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-coolGray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out group">
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
              <h3 className="text-2xl font-bold text-black mb-4">Multi-Model AI</h3>
              <p className="text-black mb-4">
                Intelligent model selection across Claude, Nova, Mistral, and Llama for optimal cost
                and performance.
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

            {/* Knowledge Management */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-coolGray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out group">
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
              <h3 className="text-2xl font-bold text-black mb-4">Smart Knowledge Base</h3>
              <p className="text-black mb-4">
                Centralized repository with semantic search, automated categorization, and RAG
                capabilities.
              </p>
              <ul className="text-sm text-black space-y-1">
                <li>• Vector-based semantic search</li>
                <li>• Automated content categorization</li>
                <li>• Template-based knowledge capture</li>
              </ul>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-coolGray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out group">
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
              <h3 className="text-2xl font-bold text-black mb-4">Privacy-First</h3>
              <p className="text-black mb-4">
                Zero-data retention AI with client sanitization and enterprise-grade security.
              </p>
              <ul className="text-sm text-black space-y-1">
                <li>• Zero-data retention AI</li>
                <li>• Client sanitization</li>
                <li>• GDPR & SOC2 compliant</li>
              </ul>
            </div>

            {/* Real-time Insights */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-coolGray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out group">
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
                AI-generated insights, pattern recognition, and trend analysis across your knowledge
                base.
              </p>
              <ul className="text-sm text-black space-y-1">
                <li>• Pattern recognition</li>
                <li>• Trend analysis</li>
                <li>• Predictive insights</li>
              </ul>
            </div>

            {/* Cost Optimization */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-coolGray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out group">
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
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-coolGray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out group">
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

          {/* Stats Content */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Trusted by Consultants Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
              Join thousands of consultants who have transformed their practice with AI-powered
              knowledge management
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
              <div className="text-center">
                <div className="text-5xl font-bold text-tekhelet-500 mb-2">80%</div>
                <div className="text-gray-600">Faster Knowledge Retrieval</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-tekhelet-500 mb-2">70%</div>
                <div className="text-gray-600">More Insights Generated</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-tekhelet-500 mb-2">90%</div>
                <div className="text-gray-600">Reduced Knowledge Silos</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-tekhelet-500 mb-2">100%</div>
                <div className="text-gray-600">Data Privacy Guaranteed</div>
              </div>
            </div>
          </div>

          {/* CTA Content */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Ready to Transform Your Consulting Practice?
            </h2>
            <p className="text-xl text-black mb-12">
              Start your free trial today and experience the power of AI-native knowledge
              management. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white px-12 py-4 text-lg"
                >
                  Start Free Trial
                </Button>
              </SignUpButton>
              <Button
                variant="outline"
                size="lg"
                className="border-coolGray-300 text-coolGray-700 hover:bg-coolGray-50 px-12 py-4 text-lg"
              >
                Schedule Demo
              </Button>
            </div>

            <div className="text-sm text-black mb-20">
              <p>✓ 14-day free trial • ✓ No setup fees • ✓ Cancel anytime</p>
            </div>
          </div>

          {/* Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-gray-200">
            <div className="flex items-center mb-4 md:mb-0">
              <Image
                src="/logos/logofooter.png"
                alt="Consailt Logo"
                width={320}
                height={96}
                className="h-20 w-auto"
              />
            </div>
            <div className="text-gray-500 text-sm">© 2025 Consailt. All rights reserved.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
