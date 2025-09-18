"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

export default function ChangelogPage() {
  const changelogEntries = [
    {
      version: "v2.1.0",
      date: "January 15, 2025",
      type: "major",
      changes: [
        "Added support for Claude 3.7 Sonnet model",
        "Improved AI response accuracy by 15%",
        "Enhanced knowledge base search with semantic understanding",
        "New project templates for common consulting scenarios",
      ],
    },
    {
      version: "v2.0.5",
      date: "January 10, 2025",
      type: "minor",
      changes: [
        "Fixed issue with large file uploads",
        "Improved mobile responsiveness",
        "Added dark mode support",
        "Enhanced error handling for API calls",
      ],
    },
    {
      version: "v2.0.0",
      date: "January 1, 2025",
      type: "major",
      changes: [
        "Complete UI redesign with glass-morphism design",
        "New unified platform replacing multiple tools",
        "Advanced AI model orchestration",
        "Enhanced security with zero-data retention",
        "New team collaboration features",
      ],
    },
    {
      version: "v1.8.2",
      date: "December 20, 2024",
      type: "patch",
      changes: [
        "Fixed memory leak in knowledge base processing",
        "Improved performance for large datasets",
        "Updated dependencies for security patches",
      ],
    },
    {
      version: "v1.8.0",
      date: "December 15, 2024",
      type: "minor",
      changes: [
        "Added integration with Microsoft Teams",
        "New automated insights generation",
        "Enhanced project risk analysis",
        "Improved user onboarding flow",
      ],
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "major":
        return "bg-tekhelet-100 text-tekhelet-700";
      case "minor":
        return "bg-teal-100 text-teal-700";
      case "patch":
        return "bg-maize-100 text-maize-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
                  Changelog
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Stay up to date with the latest improvements and new features in Consailt.
              </p>
            </div>

            {/* Changelog Entries */}
            <div className="space-y-8">
              {changelogEntries.map((entry) => (
                <div
                  key={entry.version}
                  className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-2xl font-bold text-black">{entry.version}</h2>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(entry.type)}`}
                      >
                        {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                      </span>
                    </div>
                    <span className="text-gray-500">{entry.date}</span>
                  </div>
                  <ul className="space-y-3">
                    {entry.changes.map((change) => (
                      <li key={change} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Subscribe to Updates */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mt-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-black mb-4">Stay Updated</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Get notified about new features, improvements, and important updates.
                </p>
                <div className="max-w-md mx-auto flex gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tekhelet-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                  <Button className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white px-6">
                    Subscribe
                  </Button>
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
