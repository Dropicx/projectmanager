"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import { GlobalButton } from "@/components/GlobalButton";
import Footer from "../../components/Footer";

export default function GdprPage() {
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
          {/* Page Content Card */}
          <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 mb-20 shadow-2xl">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                <span className="bg-gradient-to-r from-tekhelet-500 via-teal-500 to-maize-500 bg-clip-text text-transparent">
                  GDPR Compliance
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Your data protection rights under the General Data Protection Regulation (GDPR).
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              {/* GDPR Overview */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">GDPR Overview</h2>
                <p className="text-gray-600 leading-relaxed">
                  Consailt is fully compliant with the General Data Protection Regulation (GDPR),
                  which gives you control over your personal data and ensures transparency in how we
                  collect, process, and protect your information.
                </p>
              </div>

              {/* Your Rights */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Your Data Protection Rights</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">Right of Access</h3>
                      <p className="text-gray-600">
                        You can request a copy of all personal data we hold about you.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Right to Rectification
                      </h3>
                      <p className="text-gray-600">
                        You can request correction of inaccurate or incomplete data.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">Right to Erasure</h3>
                      <p className="text-gray-600">
                        You can request deletion of your personal data in certain circumstances.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Right to Restrict Processing
                      </h3>
                      <p className="text-gray-600">
                        You can request limitation of how we process your data.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 font-bold">5</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Right to Data Portability
                      </h3>
                      <p className="text-gray-600">
                        You can request transfer of your data to another service provider.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tekhelet-600 font-bold">6</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">Right to Object</h3>
                      <p className="text-gray-600">
                        You can object to processing of your data for certain purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Processing */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">How We Process Your Data</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Legal Basis</h3>
                    <p className="text-gray-600">
                      We process your personal data based on legitimate interest, contract
                      performance, and consent where required.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Data Minimization</h3>
                    <p className="text-gray-600">
                      We only collect and process data that is necessary for providing our services.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">Purpose Limitation</h3>
                    <p className="text-gray-600">
                      We use your data only for the purposes for which it was collected.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Protection Officer */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Data Protection Officer</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We have appointed a Data Protection Officer (DPO) to ensure compliance with GDPR
                  and to handle your data protection inquiries.
                </p>
                <div className="space-y-2 text-gray-600">
                  <p>Email: dpo@consailt.com</p>
                  <p>Phone: +1 (555) 123-4567</p>
                  <p>Address: 123 Consulting Street, San Francisco, CA 94105</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-4">Exercise Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To exercise any of your GDPR rights, please contact us using the information
                  below. We will respond to your request within 30 days.
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
