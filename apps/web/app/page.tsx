'use client'

import { SignInButton, SignUpButton, useUser, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@consulting-platform/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Consulting Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Enterprise-grade project management platform with AI-powered insights, 
            knowledge management, and real-time collaboration for consultants.
          </p>
          
          <div className="flex gap-4 justify-center">
            <SignInButton mode="modal">
              <Button size="lg">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline" size="lg">Get Started</Button>
            </SignUpButton>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">AI-Powered Insights</h3>
            <p className="text-gray-600">
              Get intelligent project analysis, risk assessment, and recommendations 
              powered by multiple AI models including Claude, Nova, and Mistral.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Knowledge Management</h3>
            <p className="text-gray-600">
              Build and search your knowledge base with RAG capabilities, 
              making institutional knowledge easily accessible and actionable.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Real-time Collaboration</h3>
            <p className="text-gray-600">
              Work together seamlessly with real-time updates, notifications, 
              and collaborative project management tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
