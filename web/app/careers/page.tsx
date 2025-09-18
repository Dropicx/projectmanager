"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

export default function CareersPage() {
  const jobOpenings = [
    {
      title: "Senior AI Engineer",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      department: "Engineering",
      description:
        "Lead the development of our AI orchestration platform and work with cutting-edge language models.",
    },
    {
      title: "Product Manager",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      department: "Product",
      description:
        "Drive product strategy and work with engineering to build features that delight our consailors.",
    },
    {
      title: "Customer Success Manager",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      department: "Customer Success",
      description:
        "Help our consailors succeed and grow their consulting practices with AI-powered tools.",
    },
    {
      title: "DevOps Engineer",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      department: "Engineering",
      description:
        "Build and maintain our cloud infrastructure to ensure reliability and scalability.",
    },
    {
      title: "UX Designer",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      department: "Design",
      description:
        "Create intuitive and beautiful user experiences that make AI accessible to consultants.",
    },
    {
      title: "Sales Engineer",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      department: "Sales",
      description:
        "Help enterprise clients understand and implement Consailt's AI-powered consulting platform.",
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
                  Careers
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Join our crew and help us revolutionize consulting with AI. We're building the
                future of intelligent consulting.
              </p>
            </div>

            {/* Why Work With Us */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-8 text-center">Why Work With Us?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-tekhelet-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Technology Icon"
                    >
                      <title>Technology Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Cutting-Edge Technology</h3>
                  <p className="text-gray-600">
                    Work with the latest AI models and build innovative solutions that shape the
                    future of consulting.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-maize-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Team Icon"
                    >
                      <title>Team Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Great Team</h3>
                  <p className="text-gray-600">
                    Work with talented, passionate people who are committed to making a difference
                    in the consulting world.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-maize-500 to-satinSheenGold-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Benefits Icon"
                    >
                      <title>Benefits Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Competitive Benefits</h3>
                  <p className="text-gray-600">
                    Competitive salary, equity, health benefits, and flexible work arrangements.
                  </p>
                </div>
              </div>
            </div>

            {/* Job Openings */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-8 text-center">Open Positions</h2>
              <div className="space-y-6">
                {jobOpenings.map((job) => (
                  <div
                    key={job.title}
                    className="backdrop-blur-md bg-white/20 border border-white/30 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-black mb-2 group-hover:text-tekhelet-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                          <span>•</span>
                          <span>{job.department}</span>
                        </div>
                      </div>
                      <Button className="mt-4 md:mt-0 bg-tekhelet-500 hover:bg-tekhelet-600 text-white">
                        Apply Now
                      </Button>
                    </div>
                    <p className="text-gray-600">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Culture */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Culture</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Values</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Innovation and continuous learning</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Customer-centric approach</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Transparency and open communication</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Work-life balance</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Perks & Benefits</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Remote-first work environment</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Health, dental, and vision insurance</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Equity participation</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-tekhelet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Professional development budget</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Don't See Your Role?
              </h2>
              <p className="text-lg text-black mb-8">
                We're always looking for talented people to join our crew. Send us your resume and
                tell us how you'd like to contribute.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white px-8 py-4 text-lg"
                  >
                    Contact Us
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-tekhelet-500 text-tekhelet-500 hover:bg-tekhelet-50 px-8 py-4 text-lg"
                >
                  View All Jobs
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
