"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import { GlobalButton } from "@/components/GlobalButton";
import Footer from "../../components/Footer";

export default function TermsPage() {
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
                  Terms of Service
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Please read these terms carefully before using our AI-powered consulting platform.
              </p>
              <p className="text-sm text-gray-600 mt-4">Last updated: January 1, 2025</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              {/* Acceptance of Terms */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using Consailt's services, you agree to be bound by these Terms of
                  Service. If you do not agree to these terms, please do not use our platform.
                </p>
              </div>

              {/* Description of Service */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Consailt provides an AI-powered consulting platform that includes:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>AI-powered knowledge management and search</li>
                  <li>Project planning and risk analysis tools</li>
                  <li>Multi-model AI orchestration</li>
                  <li>Team collaboration features</li>
                  <li>Integration with external data sources</li>
                </ul>
              </div>

              {/* User Accounts */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">3. User Accounts</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    To use our service, you must create an account and provide accurate information.
                    You are responsible for maintaining the security of your account.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>You must be at least 18 years old to create an account</li>
                    <li>You are responsible for all activities under your account</li>
                    <li>You must notify us immediately of any unauthorized use</li>
                    <li>We reserve the right to suspend or terminate accounts for violations</li>
                  </ul>
                </div>
              </div>

              {/* Acceptable Use */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">4. Acceptable Use</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree not to use our service for:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Any unlawful or prohibited activities</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Interfering with the proper functioning of the service</li>
                  <li>Uploading malicious code or harmful content</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Infringing on intellectual property rights</li>
                </ul>
              </div>

              {/* AI and Data Processing */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">5. AI and Data Processing</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Our AI services are provided "as is" and we make no guarantees about their
                    accuracy or reliability.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>AI responses are for informational purposes only</li>
                    <li>You should verify AI-generated information independently</li>
                    <li>We use zero-data retention AI models</li>
                    <li>Your data is processed securely and confidentially</li>
                    <li>We are not liable for decisions made based on AI outputs</li>
                  </ul>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">6. Payment Terms</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Subscription fees are billed in advance</li>
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>We may change pricing with 30 days notice</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Refunds are provided at our discretion</li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">7. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You retain ownership of your content. By using our service, you grant us a license
                  to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Process your content through our AI systems</li>
                  <li>Store and backup your data</li>
                  <li>Provide technical support and maintenance</li>
                  <li>Improve our services (using anonymized data only)</li>
                </ul>
              </div>

              {/* Limitation of Liability */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, Consailt shall not be liable for any
                  indirect, incidental, special, or consequential damages arising from your use of
                  our service.
                </p>
              </div>

              {/* Contact Information */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">9. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p>Email: legal@consailt.com</p>
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
