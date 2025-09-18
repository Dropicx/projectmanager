"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import { GlobalButton } from "@/components/GlobalButton";
import Footer from "../../components/Footer";

export default function PricingPage() {
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
                <span className="bg-gradient-to-r from-tekhelet-500 via-tekhelet-400 to-maize-500 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Simple, transparent pricing for consailors of all sizes. Choose the plan that fits
                your voyage.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Starter Plan */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-4">Starter</h3>
                  <div className="text-4xl font-bold text-tekhelet-500 mb-2">$29</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">5 AI queries per day</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Basic knowledge base</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Email support</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Basic project planning</span>
                  </li>
                </ul>
                <SignUpButton mode="modal">
                  <GlobalButton className="w-full" variant="primary">
                    Start Free Trial
                  </GlobalButton>
                </SignUpButton>
              </div>

              {/* Professional Plan */}
              <div className="backdrop-blur-md bg-white/20 border-2 border-tekhelet-500 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-tekhelet-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-4">Professional</h3>
                  <div className="text-4xl font-bold text-tekhelet-500 mb-2">$99</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Unlimited AI queries</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Advanced knowledge base</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Advanced project planning</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Risk analysis tools</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Team collaboration</span>
                  </li>
                </ul>
                <SignUpButton mode="modal">
                  <GlobalButton className="w-full" variant="primary">
                    Start Free Trial
                  </GlobalButton>
                </SignUpButton>
              </div>

              {/* Enterprise Plan */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out group">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-4">Enterprise</h3>
                  <div className="text-4xl font-bold text-tekhelet-500 mb-2">Custom</div>
                  <div className="text-gray-600">contact us</div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Everything in Professional</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">On-premise deployment</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-tekhelet-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Checkmark"
                    >
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black">SLA guarantees</span>
                  </li>
                </ul>
                <Link href="/contact">
                  <GlobalButton className="w-full" variant="secondary">
                    Contact Sales
                  </GlobalButton>
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-12 text-center">
                Frequently Asked Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="backdrop-blur-md bg-white/20 border border-white/30 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-bold text-black mb-4">
                    What's included in the free trial?
                  </h3>
                  <p className="text-gray-600">
                    The free trial includes full access to all Professional features for 14 days. No
                    credit card required.
                  </p>
                </div>
                <div className="backdrop-blur-md bg-white/20 border border-white/30 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-bold text-black mb-4">Can I change plans anytime?</h3>
                  <p className="text-gray-600">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect
                    immediately.
                  </p>
                </div>
                <div className="backdrop-blur-md bg-white/20 border border-white/30 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-bold text-black mb-4">Is there a setup fee?</h3>
                  <p className="text-gray-600">
                    No setup fees for any plan. You only pay the monthly subscription cost.
                  </p>
                </div>
                <div className="backdrop-blur-md bg-white/20 border border-white/30 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-bold text-black mb-4">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-gray-600">
                    We accept all major credit cards, PayPal, and bank transfers for Enterprise
                    plans.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Content Card */}
          <Footer />
        </div>
      </section>
    </div>
  );
}
