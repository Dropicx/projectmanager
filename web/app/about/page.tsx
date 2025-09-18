"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import { GlobalButton } from "@/components/GlobalButton";
import Footer from "../../components/Footer";

export default function AboutPage() {
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
                <GlobalButton size="md" variant="primary">
                  Get Started
                </GlobalButton>
              </SignUpButton>
            </div>
          </nav>
          {/* Page Content Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 mb-20 shadow-2xl">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                <span className="bg-gradient-to-r from-tekhelet-500 via-teal-500 to-maize-500 bg-clip-text text-transparent">
                  About Consailt
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                We're on a mission to revolutionize how consultants work by harnessing the power of
                AI to create smooth sailing through every project.
              </p>
            </div>

            {/* Mission Section */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-black text-center max-w-4xl mx-auto leading-relaxed">
                To empower consultants with AI-native tools that transform how they capture,
                organize, and leverage knowledge. We believe that every consultant should have
                access to intelligent automation that makes their work more efficient, insightful,
                and successful.
              </p>
            </div>

            {/* Story Section */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-6 text-center">Our Story</h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-black mb-6 leading-relaxed">
                  Consailt was born from a simple observation: consultants were drowning in a sea of
                  disconnected tools. Google searches, ChatGPT conversations, news feeds, security
                  alerts, and countless other platforms were creating chaos instead of clarity.
                </p>
                <p className="text-lg text-black mb-6 leading-relaxed">
                  We envisioned a different approach—a unified platform where AI serves as the wind
                  that propels consultants forward. The name "Consailt" combines "consulting" with
                  "sailing," reflecting our belief that with the right tools, every project can be a
                  smooth voyage to success.
                </p>
                <p className="text-lg text-black leading-relaxed">
                  Today, we're proud to serve thousands of consailors worldwide who have discovered
                  the power of AI-native consulting. Our platform continues to evolve, always guided
                  by our core principle: technology should amplify human expertise, not replace it.
                </p>
              </div>
            </div>

            {/* Values Section */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-tekhelet-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Innovation Icon"
                    >
                      <title>Innovation Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Innovation</h3>
                  <p className="text-gray-600">
                    We constantly push the boundaries of what's possible with AI in consulting.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-maize-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Privacy Icon"
                    >
                      <title>Privacy Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Privacy</h3>
                  <p className="text-gray-600">
                    Your data security and privacy are our top priorities in everything we build.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-maize-500 to-satinSheenGold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Community Icon"
                    >
                      <title>Community Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Community</h3>
                  <p className="text-gray-600">
                    We're building a community of consailors who support and learn from each other.
                  </p>
                </div>
              </div>
            </div>

            {/* Team Section */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-8 text-center">Meet the Crew</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-tekhelet-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">JD</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">John Doe</h3>
                  <p className="text-tekhelet-600 font-medium mb-2">Founder & CEO</p>
                  <p className="text-gray-600 text-sm">
                    Former McKinsey consultant with 15+ years experience in AI and consulting.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-maize-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">JS</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">Jane Smith</h3>
                  <p className="text-tekhelet-600 font-medium mb-2">CTO</p>
                  <p className="text-gray-600 text-sm">
                    AI researcher and former Google engineer specializing in natural language
                    processing.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-maize-500 to-satinSheenGold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">MJ</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">Mike Johnson</h3>
                  <p className="text-tekhelet-600 font-medium mb-2">Head of Product</p>
                  <p className="text-gray-600 text-sm">
                    Product strategist with deep experience in B2B SaaS and consulting tools.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Ready to Join Our Voyage?
              </h2>
              <p className="text-lg text-black mb-8">
                Become part of the consailor community and experience the future of consulting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignUpButton mode="modal">
                  <GlobalButton size="lg" variant="primary">
                    Start Free Trial
                  </GlobalButton>
                </SignUpButton>
                <Link href="/contact">
                  <GlobalButton size="lg" variant="secondary">
                    Contact Us
                  </GlobalButton>
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
