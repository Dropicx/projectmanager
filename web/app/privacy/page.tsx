"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import { GlobalButton } from "@/components/GlobalButton";
import Footer from "../../components/Footer";

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/background/gradient01.jpg')",
      }}
    >
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
                  Privacy Policy
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Your privacy is our priority. Learn how we protect and handle your data.
              </p>
              <p className="text-sm text-gray-600 mt-4">Last updated: January 1, 2025</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              {/* Introduction */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  At Consailt, we are committed to protecting your privacy and ensuring the security
                  of your personal information. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our AI-powered consulting
                  platform.
                </p>
              </div>

              {/* Information We Collect */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Name and contact information (email, phone number)</li>
                      <li>Company information and job title</li>
                      <li>Account credentials and profile information</li>
                      <li>Payment and billing information</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Usage Information</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Platform usage patterns and interactions</li>
                      <li>AI query history and responses</li>
                      <li>Knowledge base content and documents</li>
                      <li>Device and browser information</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Information */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Provide and improve our AI-powered consulting services</li>
                  <li>Process transactions and manage your account</li>
                  <li>Send important updates and communications</li>
                  <li>Analyze usage patterns to enhance platform functionality</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations and regulatory requirements</li>
                </ul>
              </div>

              {/* Data Security */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Data Security</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>End-to-end encryption for all data transmission</li>
                  <li>Zero-data retention AI processing</li>
                  <li>Client data sanitization before AI processing</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication protocols</li>
                  <li>GDPR and SOC2 compliance</li>
                </ul>
              </div>

              {/* AI and Data Processing */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">AI and Data Processing</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our AI systems are designed with privacy-first principles:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>All AI processing uses zero-data retention models</li>
                  <li>Client data is automatically sanitized before AI analysis</li>
                  <li>No personal information is stored in AI model training data</li>
                  <li>AI responses are generated without retaining input data</li>
                  <li>You can opt-out of AI processing at any time</li>
                </ul>
              </div>

              {/* Your Rights */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Access and download your data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Data portability to other services</li>
                  <li>Object to certain processing activities</li>
                </ul>
              </div>

              {/* Contact Information */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please
                  contact us:
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
          <Footer />{" "}
        </div>
      </section>
    </div>
  );
}
