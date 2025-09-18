"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";

export default function BlogPage() {
  const blogPosts = [
    {
      title: "The Future of AI-Powered Consulting",
      excerpt:
        "How artificial intelligence is revolutionizing the consulting industry and what it means for consailors worldwide.",
      date: "January 15, 2025",
      readTime: "5 min read",
      category: "AI & Technology",
      image: "/api/placeholder/400/250",
    },
    {
      title: "5 Ways to Optimize Your Knowledge Management",
      excerpt:
        "Best practices for organizing and leveraging your consulting knowledge base with AI assistance.",
      date: "January 10, 2025",
      readTime: "7 min read",
      category: "Best Practices",
      image: "/api/placeholder/400/250",
    },
    {
      title: "From Chaos to Smooth Sailing: A Consultant's Journey",
      excerpt: "Real stories from consailors who transformed their practice with unified AI tools.",
      date: "January 5, 2025",
      readTime: "6 min read",
      category: "Success Stories",
      image: "/api/placeholder/400/250",
    },
    {
      title: "Understanding AI Model Selection for Consulting",
      excerpt:
        "A deep dive into choosing the right AI models for different consulting scenarios and use cases.",
      date: "December 28, 2024",
      readTime: "8 min read",
      category: "Technical",
      image: "/api/placeholder/400/250",
    },
    {
      title: "The Economics of AI in Consulting",
      excerpt:
        "How AI is changing the cost structure and value proposition of consulting services.",
      date: "December 20, 2024",
      readTime: "6 min read",
      category: "Business",
      image: "/api/placeholder/400/250",
    },
    {
      title: "Building Trust in AI-Assisted Consulting",
      excerpt:
        "Strategies for maintaining client confidence while leveraging AI tools in your consulting practice.",
      date: "December 15, 2024",
      readTime: "5 min read",
      category: "Client Relations",
      image: "/api/placeholder/400/250",
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
                  Blog
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Insights, tips, and stories from the world of AI-powered consulting.
              </p>
            </div>

            {/* Featured Post */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block px-3 py-1 bg-tekhelet-100 text-tekhelet-700 rounded-full text-sm font-medium mb-4">
                    Featured
                  </div>
                  <h2 className="text-3xl font-bold text-black mb-4">
                    The Future of AI-Powered Consulting
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    How artificial intelligence is revolutionizing the consulting industry and what
                    it means for consailors worldwide. Discover the trends shaping the future of
                    consulting.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <span>January 15, 2025</span>
                    <span>•</span>
                    <span>5 min read</span>
                    <span>•</span>
                    <span>AI & Technology</span>
                  </div>
                  <Button className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white">
                    Read More
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-tekhelet-500 to-teal-500 rounded-2xl h-64 flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="AI Brain Icon"
                  >
                    <title>AI Brain Icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogPosts.slice(1).map((post) => (
                <div
                  key={post.title}
                  className="backdrop-blur-md bg-white/20 border border-white/30 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out group"
                >
                  <div className="bg-gradient-to-br from-teal-500 to-maize-500 rounded-lg h-48 flex items-center justify-center mb-4">
                    <svg
                      className="w-16 h-16 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Document Icon"
                    >
                      <title>Document Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                  <div className="inline-block px-2 py-1 bg-tekhelet-100 text-tekhelet-700 rounded-full text-xs font-medium mb-3">
                    {post.category}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:text-tekhelet-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-black mb-4">Stay Updated</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Get the latest insights on AI-powered consulting delivered to your inbox.
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

            {/* Categories */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-black mb-6">Categories</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  "AI & Technology",
                  "Best Practices",
                  "Success Stories",
                  "Technical",
                  "Business",
                  "Client Relations",
                ].map((category) => (
                  <span
                    key={category}
                    className="px-4 py-2 bg-tekhelet-100 text-tekhelet-700 rounded-full text-sm font-medium hover:bg-tekhelet-200 cursor-pointer transition-colors"
                  >
                    {category}
                  </span>
                ))}
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
