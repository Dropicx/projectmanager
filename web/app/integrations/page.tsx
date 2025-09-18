"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import { GlobalButton } from "@/components/GlobalButton";
import Footer from "../../components/Footer";

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "Slack",
      description: "Get AI insights directly in your team channels",
      status: "Available",
    },
    {
      name: "Microsoft Teams",
      description: "Integrate Consailt with your Teams workspace",
      status: "Available",
    },
    {
      name: "Google Workspace",
      description: "Sync with Google Docs, Sheets, and Drive",
      status: "Available",
    },
    {
      name: "Notion",
      description: "Export knowledge and insights to Notion pages",
      status: "Available",
    },
    {
      name: "Salesforce",
      description: "Connect with your CRM for client insights",
      status: "Coming Soon",
    },
    {
      name: "HubSpot",
      description: "Sync project data with your marketing automation",
      status: "Coming Soon",
    },
    { name: "Zapier", description: "Connect with 5000+ apps via Zapier", status: "Available" },
    {
      name: "Webhook",
      description: "Custom webhook integrations for any system",
      status: "Available",
    },
  ];

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
                  Integrations
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Connect Consailt with your favorite tools and streamline your consulting workflow.
              </p>
            </div>

            {/* Integration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="backdrop-blur-md bg-white/20 border border-white/30 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-tekhelet-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {integration.name.charAt(0)}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        integration.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {integration.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2 group-hover:text-tekhelet-600 transition-colors">
                    {integration.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{integration.description}</p>
                </div>
              ))}
            </div>

            {/* Custom Integration */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-6">Need a Custom Integration?</h2>
              <p className="text-lg text-black mb-8">
                Don't see your tool listed? We can build custom integrations for your specific
                needs. Our API-first architecture makes it easy to connect with any system.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">What We Can Build</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Custom API connectors</li>
                    <li>• Webhook integrations</li>
                    <li>• Data synchronization tools</li>
                    <li>• Custom dashboards</li>
                    <li>• Automated workflows</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Development Process</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Requirements gathering</li>
                    <li>• Technical design review</li>
                    <li>• Development and testing</li>
                    <li>• Deployment and monitoring</li>
                    <li>• Ongoing support</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Ready to Connect Your Tools?
              </h2>
              <p className="text-lg text-black mb-8">
                Start integrating Consailt with your existing workflow today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignUpButton mode="modal">
                  <GlobalButton size="lg" variant="primary">
                    Start Integrating
                  </GlobalButton>
                </SignUpButton>
                <Link href="/contact">
                  <GlobalButton size="lg" variant="secondary">
                    Request Custom Integration
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
