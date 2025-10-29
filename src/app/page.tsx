'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 shadow-sm bg-white/80 backdrop-blur-md">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-xl font-bold text-white">📊</span>
              </div>
              <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                FinScore Analyzer
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="items-center hidden space-x-8 md:flex">
              <Link href="#features" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                Features
              </Link>
              <Link href="#how-it-works" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                How It Works
              </Link>
              <Link href="#pricing" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                Pricing
              </Link>
              <Link href="/login" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="p-2 rounded-lg md:hidden hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="py-4 border-t border-gray-200 md:hidden">
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-gray-700 transition-colors hover:text-blue-600">Features</Link>
                <Link href="#how-it-works" className="text-gray-700 transition-colors hover:text-blue-600">How It Works</Link>
                <Link href="#pricing" className="text-gray-700 transition-colors hover:text-blue-600">Pricing</Link>
                <Link href="/login" className="text-gray-700 transition-colors hover:text-blue-600">Login</Link>
                <Link href="/signup" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center">
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container px-4 py-20 mx-auto sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
              #1 AI Bank Statement Analyzer in India 🇮🇳
            </span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            AI-Powered Bank Statement
            <br />
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Analysis for Lenders
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto mb-10 text-xl leading-relaxed text-gray-600">
            Analyze password-protected bank statements from all Indian banks in minutes. 
            Detect fraud, assess risk, and make smarter credit decisions with AI-powered insights.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="w-full px-8 py-4 text-lg font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-2xl hover:-translate-y-1 sm:w-auto"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/test"
              className="w-full px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-200 border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:text-blue-600 sm:w-auto"
            >
              View Demo
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">99.9% Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="font-medium">Trusted by 500+ Lenders</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Compact & Elegant */}
      <section id="features" className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              16 Powerful Analysis Modules
            </h2>
            <p className="text-lg text-gray-600">
              AI-Powered • Real-time • Bank-Grade Security
            </p>
          </div>

          {/* Compact Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8 md:grid-cols-4">
            {[
              { icon: '🚀', title: 'Fast Processing', subtitle: '10K+ txns/60s' },
              { icon: '🎯', title: 'Smart Categories', subtitle: '15+ types, 95% accuracy' },
              { icon: '🔍', title: 'Fraud Detection', subtitle: 'Multi-layer analysis' },
              { icon: '�', title: 'Risk Scoring', subtitle: '0-100 scale' },
              { icon: '💰', title: 'FOIR Calculator', subtitle: 'Auto EMI detect' },
              { icon: '✅', title: 'Income Verify', subtitle: 'Salary patterns' },
              { icon: '🏦', title: 'Banking Score', subtitle: 'Behavior analysis' },
              { icon: '📊', title: 'Trends & Alerts', subtitle: 'Anomaly detect' },
              { icon: '🤝', title: 'Counterparty', subtitle: 'Payee tracking' },
              { icon: '📑', title: 'Multi-Account', subtitle: 'Consolidation' },
              { icon: '🎯', title: 'Bank Detect', subtitle: '50+ formats' },
              { icon: '💳', title: 'Credit Bureau', subtitle: 'CIBIL/Experian' },
              { icon: '🤖', title: 'AI Insights', subtitle: 'GPT-4 powered' },
              { icon: '📱', title: 'Multi-Format', subtitle: 'PDF/CSV/Excel' },
              { icon: '🔒', title: 'Enterprise Security', subtitle: 'Bank-grade' },
              { icon: '📄', title: 'Pro Reports', subtitle: 'PDF/Excel export' }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-4 transition-all duration-200 bg-white border border-gray-200 rounded-lg cursor-pointer group hover:border-blue-500 hover:shadow-lg"
              >
                <div className="mb-2 text-3xl transition-transform group-hover:scale-110">{feature.icon}</div>
                <h3 className="mb-1 text-sm font-bold text-gray-900">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 p-6 text-white md:grid-cols-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold">16</div>
              <div className="text-xs opacity-90">Analysis Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-xs opacity-90">Bank Formats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-xs opacity-90">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">60s</div>
              <div className="text-xs opacity-90">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-xs opacity-90">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">SOC 2</div>
              <div className="text-xs opacity-90">Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="py-20 text-white bg-gray-900">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Bank-Grade Security & Compliance</h2>
            <p className="text-lg text-gray-400">Your data is protected with enterprise-level security measures</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: '🔐',
                title: 'AES-256 Encryption',
                description: 'Military-grade encryption for data at rest and in transit'
              },
              {
                icon: '🛡️',
                title: 'Row-Level Security',
                description: 'Supabase RLS ensures users only access their own data'
              },
              {
                icon: '🔑',
                title: 'OAuth 2.0 Auth',
                description: 'Secure authentication with JWT tokens and session management'
              },
              {
                icon: '📊',
                title: 'Audit Logging',
                description: 'Complete audit trail of all data access and modifications'
              },
              {
                icon: '🏢',
                title: 'SOC 2 Type II',
                description: 'Infrastructure compliant with SOC 2 security standards'
              },
              {
                icon: '🇮🇳',
                title: 'India Data Residency',
                description: 'All data stored in India-based servers for compliance'
              },
              {
                icon: '🔄',
                title: 'Automatic Backups',
                description: 'Daily backups with point-in-time recovery capability'
              },
              {
                icon: '🚨',
                title: 'Real-time Monitoring',
                description: 'Sentry integration for error tracking and alerting'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-3 text-4xl">{item.icon}</div>
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Powerful Analysis Pipeline
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              From upload to actionable insights in under 60 seconds
            </p>
          </div>

          <div className="grid max-w-6xl gap-12 mx-auto mb-16 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Upload & Parse',
                description: 'Drag and drop bank statements (PDF, CSV, Excel). We handle password-protected PDFs, OCR for scanned docs, and auto-detect 50+ bank formats',
                icon: '📤',
                tech: ['pdf-parse', 'Tesseract.js OCR', 'ExcelJS', 'Auto bank detection']
              },
              {
                step: '02',
                title: 'Deep Analysis',
                description: 'Our AI engine processes transactions through 13+ analysis modules including fraud detection, risk scoring, FOIR calculation, and income verification',
                icon: '⚡',
                tech: ['BullMQ job queue', 'Redis caching', 'OpenAI GPT-4', 'Real-time WebSocket']
              },
              {
                step: '03',
                title: 'Insights & Reports',
                description: 'View comprehensive dashboards with interactive charts, red alerts, risk scores, and export professional PDF/Excel reports with custom branding',
                icon: '📈',
                tech: ['Chart.js', 'jsPDF export', 'Excel templates', 'Real-time updates']
              }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 text-5xl text-white transition-transform transform shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:scale-110">
                  {item.icon}
                </div>
                <div className="mb-4 text-6xl font-bold text-gray-200">{item.step}</div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">{item.title}</h3>
                <p className="mb-4 leading-relaxed text-gray-600">{item.description}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {item.tech.map((t, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-medium text-blue-600 bg-white rounded-full shadow-sm">
                      {t}
                    </span>
                  ))}
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 -right-6 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                )}
              </div>
            ))}
          </div>

          {/* Supported Banks Section */}
          <div className="p-8 bg-white shadow-xl rounded-3xl md:p-12">
            <h3 className="mb-8 text-3xl font-bold text-center text-gray-900">Supported Banks & Formats</h3>
            
            <div className="grid gap-8 mb-8 md:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800">
                  <span className="text-2xl">🏦</span>
                  Major Indian Banks (50+)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank',
                    'Kotak Mahindra', 'Yes Bank', 'IndusInd Bank', 'IDFC First Bank',
                    'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank'
                  ].map((bank, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">{bank}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800">
                  <span className="text-2xl">📄</span>
                  File Format Support
                </h4>
                <div className="space-y-4">
                  {[
                    { format: 'PDF', features: ['Password-protected', 'OCR for scanned docs', 'Multi-page support', 'Table extraction'] },
                    { format: 'CSV', features: ['All encodings', 'Custom delimiters', 'Header detection', 'Auto-mapping'] },
                    { format: 'Excel (XLSX)', features: ['Multiple sheets', 'Formatted cells', 'Date recognition', 'Formula evaluation'] }
                  ].map((item, idx) => (
                    <div key={idx} className="pl-4 border-l-4 border-blue-500">
                      <h5 className="mb-2 font-bold text-gray-900">{item.format}</h5>
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feat, i) => (
                          <span key={i} className="px-2 py-1 text-xs text-blue-700 rounded bg-blue-50">
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <p className="font-medium text-gray-700">
                <span className="font-bold text-blue-600">Bank not listed?</span> Our smart parser auto-detects and processes statements from any bank with standard format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Choose the plan that fits your lending volume. No hidden fees.
            </p>
          </div>

          <div className="grid max-w-6xl gap-8 mx-auto md:grid-cols-3">
            {[
              {
                name: 'Starter',
                price: '₹999',
                period: '/month',
                description: 'Perfect for small NBFCs and startups',
                features: [
                  '100 analyses/month',
                  'All 13+ analysis modules',
                  'PDF & Excel export',
                  'Email support',
                  'Basic fraud detection',
                  'Risk scoring',
                  '7-day data retention'
                ],
                cta: 'Start Free Trial',
                popular: false
              },
              {
                name: 'Professional',
                price: '₹4,999',
                period: '/month',
                description: 'Most popular for growing fintechs',
                features: [
                  '500 analyses/month',
                  'AI-powered insights',
                  'Custom branding',
                  'Priority support',
                  'Advanced fraud detection',
                  'API access',
                  '90-day data retention',
                  'WebSocket real-time updates'
                ],
                cta: 'Start Free Trial',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For high-volume lenders',
                features: [
                  'Unlimited analyses',
                  'Dedicated support',
                  'Custom integrations',
                  'SLA guarantee',
                  'White-label solution',
                  'On-premise deployment',
                  'Unlimited data retention',
                  'Custom analysis modules'
                ],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-600 transition-colors'
                }`}
              >
                {plan.popular && (
                  <div className="absolute transform -translate-x-1/2 -top-4 left-1/2">
                    <span className="px-4 py-1 text-sm font-bold text-gray-900 bg-yellow-400 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          plan.popular ? 'text-yellow-300' : 'text-green-500'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={plan.popular ? 'text-white' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                  className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-gray-600">
              All plans include: ✅ SSL encryption • ✅ SOC 2 compliance • ✅ 24/7 uptime monitoring • ✅ Automatic updates
            </p>
            <p className="text-sm text-gray-500">
              Need a custom plan? <Link href="/contact" className="font-semibold text-blue-600 hover:underline">Contact our sales team</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container relative z-10 px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Ready to 10X Your Underwriting Speed?
          </h2>
          <p className="max-w-3xl mx-auto mb-8 text-xl text-blue-100">
            Join 500+ NBFCs, Fintechs, and Banks using FinScore Analyzer to process 50,000+ statements monthly with 99.9% accuracy
          </p>

          {/* Stats Row */}
          <div className="grid max-w-4xl grid-cols-2 gap-8 mx-auto mb-10 md:grid-cols-4">
            {[
              { value: '50,000+', label: 'Statements Analyzed' },
              { value: '500+', label: 'Active Lenders' },
              { value: '99.9%', label: 'Accuracy Rate' },
              { value: '<60s', label: 'Avg Processing Time' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-2 text-3xl font-bold text-white md:text-4xl">{stat.value}</div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-blue-600 transition-all duration-200 transform bg-white rounded-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Start Free 14-Day Trial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 border-2 border-white rounded-xl hover:bg-white hover:text-blue-600"
            >
              Schedule Demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>

          <p className="mt-6 text-sm text-blue-100">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white bg-gray-900">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center mb-4 space-x-2 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <span className="text-xl font-bold">FinScore Analyzer</span>
            </div>
            <p className="text-gray-400">
              © 2025 FinScore Analyzer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
