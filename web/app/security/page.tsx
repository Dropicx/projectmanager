import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@consulting-platform/ui";
import Image from "next/image";
import Link from "next/link";

export default function SecurityPage() {
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
                  Security & Privacy
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed">
                Your data security and privacy are our top priorities. Learn about our comprehensive
                security measures.
              </p>
            </div>

            {/* Security Overview */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-6">Security Overview</h2>
              <p className="text-lg text-black mb-8 leading-relaxed">
                Consailt implements enterprise-grade security measures to protect your data and
                ensure the highest levels of privacy and confidentiality for all consailors.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-tekhelet-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Data Encryption Icon"
                    >
                      <title>Data Encryption Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Data Encryption</h3>
                  <p className="text-gray-600">
                    End-to-end encryption for all data in transit and at rest using AES-256.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-maize-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Zero Data Retention Icon"
                    >
                      <title>Zero Data Retention Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Zero Data Retention</h3>
                  <p className="text-gray-600">
                    AI processing with zero data retention to ensure your information is never
                    stored.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-maize-500 to-satinSheenGold-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Compliance Icon"
                    >
                      <title>Compliance Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Compliance</h3>
                  <p className="text-gray-600">
                    GDPR, SOC2, and industry-standard compliance certifications.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-8">Security Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-tekhelet-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="Checkmark Icon"
                      >
                        <title>Checkmark Icon</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Multi-Factor Authentication
                      </h3>
                      <p className="text-gray-600">Secure access with 2FA and SSO integration</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-tekhelet-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="Checkmark Icon"
                      >
                        <title>Checkmark Icon</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Client Data Sanitization
                      </h3>
                      <p className="text-gray-600">
                        Automatic removal of sensitive information before AI processing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-tekhelet-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="Checkmark Icon"
                      >
                        <title>Checkmark Icon</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Regular Security Audits
                      </h3>
                      <p className="text-gray-600">
                        Third-party security assessments and penetration testing
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-tekhelet-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="Checkmark Icon"
                      >
                        <title>Checkmark Icon</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">Access Controls</h3>
                      <p className="text-gray-600">
                        Role-based permissions and activity monitoring
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-tekhelet-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="Checkmark Icon"
                      >
                        <title>Checkmark Icon</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Secure Infrastructure
                      </h3>
                      <p className="text-gray-600">
                        AWS-based infrastructure with enterprise-grade security
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-tekhelet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-tekhelet-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-label="Checkmark Icon"
                      >
                        <title>Checkmark Icon</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">Data Residency</h3>
                      <p className="text-gray-600">
                        Choose where your data is stored and processed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl mb-12">
              <h2 className="text-3xl font-bold text-black mb-8">Compliance & Certifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-white/10 rounded-lg">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="font-semibold text-black mb-2">GDPR</h3>
                  <p className="text-sm text-gray-600">EU data protection compliance</p>
                </div>
                <div className="text-center p-6 bg-white/10 rounded-lg">
                  <div className="text-3xl mb-3">🔒</div>
                  <h3 className="font-semibold text-black mb-2">SOC 2</h3>
                  <p className="text-sm text-gray-600">Security and availability controls</p>
                </div>
                <div className="text-center p-6 bg-white/10 rounded-lg">
                  <div className="text-3xl mb-3">✅</div>
                  <h3 className="font-semibold text-black mb-2">ISO 27001</h3>
                  <p className="text-sm text-gray-600">Information security management</p>
                </div>
                <div className="text-center p-6 bg-white/10 rounded-lg">
                  <div className="text-3xl mb-3">🏛️</div>
                  <h3 className="font-semibold text-black mb-2">HIPAA</h3>
                  <p className="text-sm text-gray-600">Healthcare data protection</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Questions About Security?
              </h2>
              <p className="text-lg text-black mb-8">
                Our security team is here to answer any questions about our security measures and
                compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-tekhelet-500 hover:bg-tekhelet-600 text-white px-8 py-4 text-lg"
                  >
                    Contact Security Team
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-tekhelet-500 text-tekhelet-500 hover:bg-tekhelet-50 px-8 py-4 text-lg"
                  >
                    Privacy Policy
                  </Button>
                </Link>
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
