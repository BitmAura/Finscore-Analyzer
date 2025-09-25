'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ComprehensiveLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-800">FinScore Analyzer</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</Link>
              <Link href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About Us</Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-around">
                <span className="w-full h-0.5 bg-gray-600"></span>
                <span className="w-full h-0.5 bg-gray-600"></span>
                <span className="w-full h-0.5 bg-gray-600"></span>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
                <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>How It Works</Link>
                <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                <Link href="#about" className="text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          The #1 AI Bank Statement Analyzer
          <br />
          for <span className="text-blue-600">Indian Lenders</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          The ultimate SaaS platform for NBFCs and Fintechs to analyze password-protected bank statements from all Indian banks, detect fraud, and make smarter credit decisions in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/signup"
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            View Features
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Built for India</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>99.9% Accuracy Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>SOC 2 Certified Security</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          A Powerhouse for Credit Underwriting
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Everything your credit team needs to analyze bank statements with confidence and speed.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analyze Multiple PDFs</h3>
            <p className="text-gray-600">Consolidate multiple password-protected PDFs from different banks for a single applicant.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">25+ Point AI Analysis</h3>
            <p className="text-gray-600">Our AI engine runs over 25 checks, from cheque bounces to detailed cash flow analysis.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Actionable Red Alerts</h3>
            <p className="text-gray-600">Instantly identify high-risk activity with our comprehensive Red Alert system.</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-red-600 text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Bank-Grade Security</h3>
            <p className="text-gray-600">SOC 2 certified infrastructure with end-to-end encryption for all data.</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-yellow-600 text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Powerful Analyst Dashboard</h3>
            <p className="text-gray-600">An intuitive case management system designed for the workflow of loan officers.</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-indigo-600 text-2xl">🔧</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Developer-First API</h3>
            <p className="text-gray-600">Integrate our analysis engine directly into your own systems with our modern REST API.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Three Steps to Faster, Safer Lending
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our streamlined process transforms your credit underwriting workflow.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Statements</h3>
              <p className="text-gray-600">
                Drag and drop all of an applicant&apos;s bank statements—even if they are password-protected.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Run AI Analysis</h3>
              <p className="text-gray-600">
                Our engine gets to work, analyzing transactions, detecting red flags, and generating a risk profile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Make Credit Decision</h3>
              <p className="text-gray-600">
                Use the comprehensive analysis and risk alerts to make faster, more confident credit decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Simplified for now */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Choose a plan that scales with your lending volume.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-600">
            <h3 className="text-xl font-semibold mb-2">API Access</h3>
            <p className="text-gray-600 mb-4">For integrating our analysis engine into your own software.</p>
            <div className="text-3xl font-bold text-blue-600 mb-4">Usage-Based</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span><span>Full access to all 25+ analysis modules</span></li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span><span>Generous free tier for development</span></li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span><span>Volume discounts available</span></li>
            </ul>
            <Link href="/docs" className="w-full block text-center px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
              Read API Docs
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">Analyst Dashboard</h3>
            <p className="text-gray-600 mb-4">A complete, ready-to-use case management system for your team.</p>
            <div className="text-3xl font-bold text-blue-600 mb-4">Per Seat / Month</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span><span>Unlimited statement analysis</span></li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span><span>Team collaboration features</span></li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span><span>Custom PDF report exports</span></li>
            </ul>
            <Link href="/contact-sales" className="w-full block text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Automate Your Underwriting?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the leading Indian lenders using FinScore Analyzer to process documents 
            10x faster, reduce fraud, and make smarter credit decisions.
          </p>
          <Link
            href="/demo"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Schedule a Demo
          </Link>
        </div>
      </section>

      {/* About Section (added to resolve anchor) */}
      <section id="about" className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Us</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          FinScore Analyzer is an advanced SaaS platform for financial document analysis, trusted by NBFCs and fintechs across India. Our mission is to empower lenders with AI-driven insights for smarter, faster credit decisions.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold">FinScore Analyzer</span>
          </div>
          <p className="text-gray-400 mb-4">
            AI-powered bank statement analysis for the Indian lending ecosystem.
          </p>
          <p className="text-gray-400">
            &copy; 2024 FinScore Analyzer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
