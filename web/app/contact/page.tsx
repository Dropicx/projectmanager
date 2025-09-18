import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import { useId } from "react";

export default function ContactPage() {
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const companyId = useId();
  const subjectId = useId();
  const messageId = useId();

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
                  Contact Us
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Ready to set sail with Consailt? We're here to help you navigate your consulting
                journey.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor={firstNameId}
                        className="block text-sm font-medium text-black mb-2"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id={firstNameId}
                        name="firstName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tekhelet-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={lastNameId}
                        className="block text-sm font-medium text-black mb-2"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id={lastNameId}
                        name="lastName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tekhelet-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor={emailId} className="block text-sm font-medium text-black mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id={emailId}
                      name="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tekhelet-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={companyId}
                      className="block text-sm font-medium text-black mb-2"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id={companyId}
                      name="company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tekhelet-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={subjectId}
                      className="block text-sm font-medium text-black mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id={subjectId}
                      name="subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tekhelet-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    >
                      <option>General Inquiry</option>
                      <option>Sales Question</option>
                      <option>Technical Support</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={messageId}
                      className="block text-sm font-medium text-black mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id={messageId}
                      name="message"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tekhelet-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                      placeholder="Tell us about your consulting needs..."
                    ></textarea>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-tekhelet-500 hover:bg-tekhelet-600 text-white py-3 text-lg"
                  >
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                  <h2 className="text-2xl font-bold text-black mb-6">Get in Touch</h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-tekhelet-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-label="Email Icon"
                        >
                          <title>Email Icon</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-1">Email</h3>
                        <p className="text-gray-600">hello@consailt.com</p>
                        <p className="text-gray-600">support@consailt.com</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-maize-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-label="Phone Icon"
                        >
                          <title>Phone Icon</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-1">Phone</h3>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                        <p className="text-gray-600 text-sm">Mon-Fri 9AM-6PM EST</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-maize-500 to-satinSheenGold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-label="Location Icon"
                        >
                          <title>Location Icon</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-1">Office</h3>
                        <p className="text-gray-600">123 Consulting Street</p>
                        <p className="text-gray-600">San Francisco, CA 94105</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
                  <h2 className="text-2xl font-bold text-black mb-6">Quick Links</h2>
                  <div className="space-y-4">
                    <Link
                      href="/features"
                      className="block text-tekhelet-600 hover:text-tekhelet-700 font-medium"
                    >
                      → View Features
                    </Link>
                    <Link
                      href="/pricing"
                      className="block text-tekhelet-600 hover:text-tekhelet-700 font-medium"
                    >
                      → See Pricing
                    </Link>
                    <Link
                      href="/api"
                      className="block text-tekhelet-600 hover:text-tekhelet-700 font-medium"
                    >
                      → API Documentation
                    </Link>
                    <Link
                      href="/security"
                      className="block text-tekhelet-600 hover:text-tekhelet-700 font-medium"
                    >
                      → Security & Privacy
                    </Link>
                  </div>
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
