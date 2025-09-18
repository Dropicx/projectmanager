"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

export default function PartnersPage() {
  const partners = [
    {
      name: "McKinsey & Company",
      type: "Strategic Partner",
      description: "Collaborating on AI-powered consulting methodologies",
    },
    {
      name: "Deloitte",
      type: "Technology Partner",
      description: "Integrating Consailt with enterprise consulting workflows",
    },
    {
      name: "PwC",
      type: "Implementation Partner",
      description: "Helping clients adopt AI-native consulting practices",
    },
    {
      name: "Bain & Company",
      type: "Strategic Partner",
      description: "Joint research on the future of consulting",
    },
    {
      name: "Accenture",
      type: "Technology Partner",
      description: "Enterprise deployment and customization services",
    },
    {
      name: "EY",
      type: "Implementation Partner",
      description: "Training and change management for AI adoption",
    },
  ];

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
                  Partners
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                We work with leading consulting firms and technology partners to deliver the best
                AI-powered consulting solutions.
              </p>
            </div>

            {/* Partners Grid */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Partners</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                  <div
                    key={partner.name}
                    className="backdrop-blur-md bg-white/20 border border-white/30 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-tekhelet-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">{partner.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-black mb-2 group-hover:text-tekhelet-600 transition-colors text-center">
                      {partner.name}
                    </h3>
                    <p className="text-tekhelet-600 font-medium text-sm text-center mb-3">
                      {partner.type}
                    </p>
                    <p className="text-gray-600 text-sm text-center">{partner.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Partnership Types */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-8 text-center">Partnership Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-tekhelet-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Strategic Partner Icon"
                    >
                      <title>Strategic Partner Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Strategic Partners</h3>
                  <p className="text-gray-600">
                    Long-term partnerships focused on joint innovation and market development.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-maize-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Technology Partner Icon"
                    >
                      <title>Technology Partner Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Technology Partners</h3>
                  <p className="text-gray-600">
                    Technical integrations and joint product development initiatives.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-maize-500 to-satinSheenGold-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Implementation Partner Icon"
                    >
                      <title>Implementation Partner Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Implementation Partners</h3>
                  <p className="text-gray-600">
                    Service delivery partners helping clients adopt and optimize Consailt.
                  </p>
                </div>
              </div>
            </div>

            {/* Become a Partner */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-6 text-center">Become a Partner</h2>
              <p className="text-lg text-black mb-8 text-center max-w-3xl mx-auto">
                Join our partner ecosystem and help us revolutionize consulting with AI. We offer
                various partnership opportunities for consulting firms, technology companies, and
                service providers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Partner Benefits</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Access to our partner portal and resources</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Joint marketing and co-selling opportunities</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Technical training and certification</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Dedicated partner support</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Requirements</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Established consulting or technology practice</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Commitment to AI and innovation</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Client references and case studies</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Alignment with our values and mission</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Ready to Partner With Us?
              </h2>
              <p className="text-lg text-black mb-8">
                Let's explore how we can work together to transform consulting with AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white px-8 py-4 text-lg"
                  >
                    Contact Partnership Team
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-tekhelet-500 text-tekhelet-500 hover:bg-tekhelet-50 px-8 py-4 text-lg"
                >
                  Download Partner Kit
                </Button>
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
