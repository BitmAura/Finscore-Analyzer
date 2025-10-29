'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">📊</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinScore Analyzer
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                How It Works
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
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
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
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
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</Link>
                <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">How It Works</Link>
                <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</Link>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
                <Link href="/signup" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center">
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-block mb-4">
            <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
              #1 AI Bank Statement Analyzer in India 🇮🇳
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered Bank Statement
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analysis for Lenders
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Analyze password-protected bank statements from all Indian banks in minutes. 
            Detect fraud, assess risk, and make smarter credit decisions with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/test"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200 w-full sm:w-auto"
            >
              View Demo
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-gray-500">
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive Financial Analysis Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              13+ Advanced Analysis Modules • Real-time Processing • Enterprise-Grade Security
            </p>
          </div>

          {/* Core Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: '🚀',
                title: 'Lightning-Fast Processing',
                description: 'Analyze 10,000+ transactions in under 60 seconds with our advanced multi-threaded engine',
                color: 'from-blue-500 to-blue-600',
                details: ['BullMQ job queue', 'Redis caching', 'Real-time WebSocket updates']
              },
              {
                icon: '🎯',
                title: 'Smart Categorization',
                description: '15+ transaction categories with 95%+ accuracy using ML pattern matching',
                color: 'from-purple-500 to-purple-600',
                details: ['Salary & Income', 'Food & Dining', 'Shopping', 'Banking & Finance', 'Insurance', 'Investment']
              },
              {
                icon: '🔍',
                title: 'Advanced Fraud Detection',
                description: 'Multi-layer fraud analysis with circular transaction detection and balance verification',
                color: 'from-red-500 to-red-600',
                details: ['Circular transactions', 'Temporary credits', 'Loan stacking', 'Gambling patterns', 'Crypto trading']
              },
              {
                icon: '📈',
                title: 'Risk Assessment Engine',
                description: 'Comprehensive risk scoring (0-100) with detailed factor breakdown and recommendations',
                color: 'from-orange-500 to-orange-600',
                details: ['Cheque returns', 'Cashflow volatility', 'Income stability', '15+ risk factors']
              },
              {
                icon: '💰',
                title: 'FOIR Calculator',
                description: 'Fixed Obligation to Income Ratio calculation with EMI detection and obligation tracking',
                color: 'from-green-500 to-green-600',
                details: ['Auto EMI detection', 'Income verification', 'Debt burden analysis', 'Lending eligibility']
              },
              {
                icon: '✅',
                title: 'Income Verification',
                description: 'Automated salary detection with consistency checks and stability assessment',
                color: 'from-teal-500 to-teal-600',
                details: ['Salary pattern detection', 'Frequency analysis', '3-month consistency', 'Employment stability']
              },
              {
                icon: '🏦',
                title: 'Banking Behavior Score',
                description: 'Comprehensive banking habits analysis with account vintage and transaction patterns',
                color: 'from-indigo-500 to-indigo-600',
                details: ['Account age tracking', 'Cheque bounce rate', 'Average balance', 'Banking maturity']
              },
              {
                icon: '📊',
                title: 'Trend & Anomaly Detection',
                description: 'Spending trend analysis with anomaly detection for unusual transaction patterns',
                color: 'from-pink-500 to-pink-600',
                details: ['Monthly trends', 'Anomaly detection', 'Seasonal patterns', 'Spending forecasts']
              },
              {
                icon: '🤝',
                title: 'Counterparty Analysis',
                description: 'Track frequent payees and analyze transaction relationships for business insights',
                color: 'from-rose-500 to-rose-600',
                details: ['Top payees', 'Transaction frequency', 'Relationship mapping', 'Business patterns']
              },
              {
                icon: '📑',
                title: 'Multi-Statement Consolidation',
                description: 'Combine multiple bank accounts for comprehensive cross-account financial analysis',
                color: 'from-sky-500 to-sky-600',
                details: ['Multi-account merge', 'Cross-verification', 'Consolidated balance', 'Income consistency check']
              },
              {
                icon: '🎯',
                title: 'Smart Bank Detection',
                description: 'Automatic bank format detection with account number, IFSC, and branch extraction',
                color: 'from-lime-500 to-lime-600',
                details: ['50+ bank formats', 'Auto IFSC extraction', 'Account type detection', 'Branch identification']
              },
              {
                icon: '💳',
                title: 'Credit Bureau Integration',
                description: 'Real-time credit score pulls from CIBIL, Experian with detailed factor analysis (Coming Soon)',
                color: 'from-yellow-500 to-yellow-600',
                details: ['CIBIL integration', 'Experian API', 'Credit factors', 'Score recommendations']
              },
              {
                icon: '🤖',
                title: 'AI-Powered Insights',
                description: 'OpenAI GPT-4 integration for executive summaries and intelligent recommendations',
                color: 'from-violet-500 to-violet-600',
                details: ['Executive summary', 'Cashflow prediction', 'Pattern recognition', 'Smart recommendations']
              },
              {
                icon: '📱',
                title: 'Multi-Format Parser',
                description: 'Support for PDF (password-protected), CSV, and Excel from 50+ Indian banks',
                color: 'from-cyan-500 to-cyan-600',
                details: ['HDFC, ICICI, SBI, Axis, Kotak', 'Password-protected PDFs', 'OCR for scanned docs', 'Auto bank detection']
              },
              {
                icon: '🔒',
                title: 'Enterprise Security',
                description: 'Bank-grade encryption with row-level security and SOC 2 Type II compliance',
                color: 'from-gray-700 to-gray-800',
                details: ['AES-256 encryption', 'Row-level security (RLS)', 'Supabase Auth', 'Audit logging']
              },
              {
                icon: '📄',
                title: 'Professional Reports',
                description: 'Export to PDF and Excel with branded templates and interactive charts',
                color: 'from-amber-500 to-amber-600',
                details: ['PDF export (jsPDF)', 'Excel export (ExcelJS)', 'Custom branding', 'Chart.js visualizations']
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.details.map((detail, idx) => (
                    <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Analysis Modules Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">16 Specialized Analysis Modules</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Transaction Categorization', icon: '🏷️', status: '✅' },
                { name: 'Risk Assessment', icon: '⚠️', status: '✅' },
                { name: 'Advanced Fraud Detection', icon: '🚨', status: '✅' },
                { name: 'FOIR Calculator', icon: '💳', status: '✅' },
                { name: 'Income Verification', icon: '💵', status: '✅' },
                { name: 'Banking Behavior Score', icon: '🏦', status: '✅' },
                { name: 'Monthly Summaries', icon: '📅', status: '✅' },
                { name: 'Trend Analysis', icon: '📈', status: '✅' },
                { name: 'Anomaly Detection', icon: '🔔', status: '✅' },
                { name: 'Red Alert System', icon: '🔴', status: '✅' },
                { name: 'Counterparty Analysis', icon: '🤝', status: '✅' },
                { name: 'Multi-Statement Consolidation', icon: '📑', status: '✅' },
                { name: 'Bank Format Detection', icon: '🎯', status: '✅' },
                { name: 'AI Executive Summary', icon: '🤖', status: '✅' },
                { name: 'Cashflow Prediction', icon: '�', status: '✅' },
                { name: 'Credit Bureau Integration', icon: '💳', status: '🔜' },
                { name: 'Professional Report Export', icon: '📥', status: '✅' }
              ].map((module, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-2xl">{module.icon}</span>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700 text-sm">{module.name}</span>
                  </div>
                  <span className="text-xs">{module.status}</span>
                </div>
              ))}
            </div>

            {/* Module Details */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border-l-4 border-blue-600">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Core Analysis Pipeline
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Categorization:</strong> 15+ categories with 95% accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Risk Scoring:</strong> 0-100 scale with 15+ risk factors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Fraud Detection:</strong> Multi-layer pattern matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>FOIR/Income:</strong> Auto EMI detection & salary verification</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 border-l-4 border-purple-600">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  Advanced Features
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Multi-Statement:</strong> Consolidate multiple accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>AI Insights:</strong> GPT-4 powered executive summaries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Trend Analysis:</strong> Spending forecasts & anomalies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">⏳</span>
                    <span><strong>Credit Bureau:</strong> CIBIL/Experian integration (Q1 2025)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bank-Grade Security & Compliance</h2>
            <p className="text-gray-400 text-lg">Your data is protected with enterprise-level security measures</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powerful Analysis Pipeline
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From upload to actionable insights in under 60 seconds
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto mb-16">
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
              <div key={index} className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl mx-auto mb-6 shadow-xl transform hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-6xl font-bold text-gray-200 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {item.tech.map((t, i) => (
                    <span key={i} className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full font-medium shadow-sm">
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
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Supported Banks & Formats</h3>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
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
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  File Format Support
                </h4>
                <div className="space-y-4">
                  {[
                    { format: 'PDF', features: ['Password-protected', 'OCR for scanned docs', 'Multi-page support', 'Table extraction'] },
                    { format: 'CSV', features: ['All encodings', 'Custom delimiters', 'Header detection', 'Auto-mapping'] },
                    { format: 'Excel (XLSX)', features: ['Multiple sheets', 'Formatted cells', 'Date recognition', 'Formula evaluation'] }
                  ].map((item, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-bold text-gray-900 mb-2">{item.format}</h5>
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feat, i) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
              <p className="text-gray-700 font-medium">
                <span className="text-blue-600 font-bold">Bank not listed?</span> Our smart parser auto-detects and processes statements from any bank with standard format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your lending volume. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
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

                <ul className="space-y-3 mb-8">
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
            <p className="text-gray-600 mb-4">
              All plans include: ✅ SSL encryption • ✅ SOC 2 compliance • ✅ 24/7 uptime monitoring • ✅ Automatic updates
            </p>
            <p className="text-sm text-gray-500">
              Need a custom plan? <Link href="/contact" className="text-blue-600 hover:underline font-semibold">Contact our sales team</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to 10X Your Underwriting Speed?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join 500+ NBFCs, Fintechs, and Banks using FinScore Analyzer to process 50,000+ statements monthly with 99.9% accuracy
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-10">
            {[
              { value: '50,000+', label: 'Statements Analyzed' },
              { value: '500+', label: 'Active Lenders' },
              { value: '99.9%', label: 'Accuracy Rate' },
              { value: '<60s', label: 'Avg Processing Time' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Start Free 14-Day Trial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Schedule Demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>

          <p className="mt-6 text-blue-100 text-sm">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
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
