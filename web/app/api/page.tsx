"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

export default function ApiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-tekhelet-200/40 via-white via-tekhelet-200/30 via-maize-200/35 via-satinSheenGold-200/30 to-coolGray-200/40">
      {/* Main Section with integrated header */}
      <section className="relative min-h-screen px-6 pt-8 pb-20 lg:pt-12 lg:pb-32 overflow-hidden">
        {/* Animated floating elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-tekhelet-400/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-tekhelet-400/35 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-maize-400/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-satinSheenGold-400/25 rounded-full blur-3xl animate-pulse delay-1500"></div>
        <div className="absolute top-1/4 left-1/2 w-56 h-56 bg-coolGray-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-88 h-88 bg-tekhelet-300/30 rounded-full blur-3xl animate-pulse delay-3000"></div>

        {/* Flowing background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-tekhelet-200/30 via-transparent to-maize-200/40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-tekhelet-200/20 via-transparent to-satinSheenGold-200/25"></div>

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
                <span className="bg-gradient-to-r from-tekhelet-500 via-tekhelet-400 to-maize-500 bg-clip-text text-transparent">
                  API Documentation
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Integrate Consailt's AI-powered consulting capabilities into your own applications.
              </p>
            </div>

            {/* API Overview */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-6">API Overview</h2>
              <p className="text-lg text-black mb-6 leading-relaxed">
                Our RESTful API provides programmatic access to all Consailt features, allowing you
                to build custom integrations and extend our AI-powered consulting capabilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-tekhelet-500 to-tekhelet-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Fast and Reliable Icon"
                    >
                      <title>Fast and Reliable Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">Fast & Reliable</h3>
                  <p className="text-gray-600">99.9% uptime with sub-second response times</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-tekhelet-500 to-maize-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Secure Icon"
                    >
                      <title>Secure Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">Secure</h3>
                  <p className="text-gray-600">Enterprise-grade security with OAuth 2.0</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-maize-500 to-satinSheenGold-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Developer Friendly Icon"
                    >
                      <title>Developer Friendly Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">Developer Friendly</h3>
                  <p className="text-gray-600">Comprehensive docs and SDKs</p>
                </div>
              </div>
            </div>

            {/* Quick Start */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-6">Quick Start</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">1. Get Your API Key</h3>
                  <p className="text-gray-600 mb-4">
                    Sign up for a free account and generate your API key from the dashboard.
                  </p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div>curl -X POST https://api.consailt.com/v1/auth/token \</div>
                    <div> -H "Content-Type: application/json" \</div>
                    <div> -d '{`{"api_key": "your_api_key"}`}'</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">
                    2. Make Your First Request
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Query our AI knowledge base with a simple API call.
                  </p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div>curl -X POST https://api.consailt.com/v1/query \</div>
                    <div> -H "Authorization: Bearer your_token" \</div>
                    <div> -H "Content-Type: application/json" \</div>
                    <div>
                      {" "}
                      -d '{`{"query": "What are the best practices for project management?"}`}'
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-6">Core Endpoints</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-tekhelet-500 pl-4">
                  <h3 className="text-lg font-semibold text-black mb-2">POST /v1/query</h3>
                  <p className="text-gray-600 mb-2">Query the AI knowledge base</p>
                  <div className="text-sm text-gray-500">Rate limit: 100 requests/minute</div>
                </div>
                <div className="border-l-4 border-tekhelet-500 pl-4">
                  <h3 className="text-lg font-semibold text-black mb-2">POST /v1/projects</h3>
                  <p className="text-gray-600 mb-2">Create and manage projects</p>
                  <div className="text-sm text-gray-500">Rate limit: 50 requests/minute</div>
                </div>
                <div className="border-l-4 border-maize-500 pl-4">
                  <h3 className="text-lg font-semibold text-black mb-2">GET /v1/insights</h3>
                  <p className="text-gray-600 mb-2">Retrieve AI-generated insights</p>
                  <div className="text-sm text-gray-500">Rate limit: 200 requests/minute</div>
                </div>
                <div className="border-l-4 border-satinSheenGold-500 pl-4">
                  <h3 className="text-lg font-semibold text-black mb-2">POST /v1/analyze</h3>
                  <p className="text-gray-600 mb-2">Analyze documents and data</p>
                  <div className="text-sm text-gray-500">Rate limit: 25 requests/minute</div>
                </div>
              </div>
            </div>

            {/* SDKs */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-6">SDKs & Libraries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <div className="text-2xl mb-2">🐍</div>
                  <h3 className="font-semibold text-black mb-2">Python</h3>
                  <p className="text-sm text-gray-600 mb-3">pip install consailt-python</p>
                  <Button size="sm" variant="outline" className="text-xs">
                    View Docs
                  </Button>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <div className="text-2xl mb-2">🟨</div>
                  <h3 className="font-semibold text-black mb-2">JavaScript</h3>
                  <p className="text-sm text-gray-600 mb-3">npm install consailt-js</p>
                  <Button size="sm" variant="outline" className="text-xs">
                    View Docs
                  </Button>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <div className="text-2xl mb-2">☕</div>
                  <h3 className="font-semibold text-black mb-2">Java</h3>
                  <p className="text-sm text-gray-600 mb-3">Maven/Gradle support</p>
                  <Button size="sm" variant="outline" className="text-xs">
                    View Docs
                  </Button>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <div className="text-2xl mb-2">🦀</div>
                  <h3 className="font-semibold text-black mb-2">Rust</h3>
                  <p className="text-sm text-gray-600 mb-3">cargo add consailt</p>
                  <Button size="sm" variant="outline" className="text-xs">
                    View Docs
                  </Button>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Ready to Start Building?
              </h2>
              <p className="text-lg text-black mb-8">
                Get your API key and start integrating Consailt into your applications today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white px-8 py-4 text-lg"
                  >
                    Get API Key
                  </Button>
                </SignUpButton>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-tekhelet-500 text-tekhelet-500 hover:bg-tekhelet-50 px-8 py-4 text-lg"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {/* Footer Content Card */}
          <Footer />{" "}
        </div>
      </section>
    </div>
  );
}
