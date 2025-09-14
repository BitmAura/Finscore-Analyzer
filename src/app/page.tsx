'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { 
  FileText, 
  Shield, 
  BarChart3, 
  Brain, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Upload,
  Eye,
  Download,
  Clock,
  Users,
  Star,
  TrendingUp,
  Lock,
  Globe,
  Sparkles,
  Cpu
} from 'lucide-react'
import { ScrollReveal, StaggeredReveal, FloatingElement } from '../components/animations/ScrollAnimations'
import {
  GlassMorphismCard,
  NeonButton,
  AnimatedCard,
  GradientText,
  LoadingSpinner,
  ProgressBar
} from '../components/ui/AdvancedComponents'

export default function LandingPage() {
  // Animated background and header opacity
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 400], [0, 100]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.7]);
  // State declarations for demo upload and feature selection
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setUploadProgress((prev: number) => {
          if (prev >= 100) {
            setIsLoading(false)
            return 0
          }
          return prev + Math.random() * 15
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const handleDemoUpload = () => {
    setIsLoading(true)
    setUploadProgress(0)
  }

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Smart Document Upload",
      description: "Password-protected PDF support, bulk processing, and intelligent file recognition",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced fraud detection, risk scoring, and predictive analytics with 99.9% accuracy",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Comprehensive Reports", 
      description: "15+ detailed modules covering every aspect of financial analysis",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Process 1000+ documents in minutes, not days. Real-time insights and notifications",
      color: "from-yellow-500 to-orange-500"
    }
  ]

  const reportModules = [
    "Overview & Summary",
    "Transaction Analysis", 
    "Cheque Returns & Bounces",
    "ATM Withdrawals",
    "Cash Flow Analysis",
    "Recurring Credits",
    "Recurring Debits", 
    "Loan Transactions",
    "EMI Analysis",
    "Party-wise Analysis",
    "GST Analysis",
    "Bank Balance Tracking",
    "Risk Assessment",
    "Fraud Detection",
    "Compliance Check"
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Finance Director, ABC Finance Ltd",
      content: "FinScore Analyzer reduced our document analysis time from 3 days to 30 minutes. The accuracy is incredible!",
      rating: 5
    },
    {
      name: "Priya Sharma", 
      role: "Credit Analyst, XYZ Bank",
      content: "The password-protected PDF feature is a game-changer. We can now process bank statements instantly.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "CEO, Finance Solutions Pro",
      content: "Best investment we made this year. Our clients love the detailed reports and our efficiency has tripled.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </motion.div>

      {/* Navigation */}
      <motion.nav 
        className="container mx-auto px-6 py-4 relative z-50"
        style={{ opacity: headerOpacity }}
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">
              <GradientText>FinScore Analyzer</GradientText>
            </span>
          </motion.div>
          <div className="hidden md:flex items-center space-x-8">
            <motion.a 
              href="#features" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              Features
            </motion.a>
            <motion.a 
              href="#reports" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              Reports
            </motion.a>
            <motion.a 
              href="#pricing" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              Pricing
            </motion.a>
            <NeonButton size="sm" href="/auth?mode=signup">
              Start Free Trial
            </NeonButton>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 relative z-10 overflow-hidden">
        {/* Floating Decorative Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-lg"
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-12 h-12 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-md"
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <FloatingElement intensity={10} speed={3}>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-8">
                <Sparkles className="w-4 h-4" />
                AI-Powered Financial Analysis
                <Sparkles className="w-4 h-4" />
              </div>
            </FloatingElement>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Analyze <GradientText className="text-6xl md:text-8xl">1000+</GradientText> Financial Documents in 
            <br />
            <GradientText gradient="from-purple-600 to-pink-600" className="text-5xl md:text-7xl">
              Minutes, Not Days
            </GradientText>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
          >
            Revolutionary SaaS platform powered by AI to analyze bank statements, GST reports, 
            detect fraud, and generate comprehensive insights with{' '}
            <span className="font-semibold text-green-600">99.9% accuracy</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <NeonButton 
              size="lg" 
              onClick={handleDemoUpload}
              className="group"
            >
              <span className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="border-white" />
                    Processing Demo...
                  </>
                ) : (
                  <>
                    <Cpu className="w-5 h-5" />
                    Try AI Demo
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </NeonButton>
            
            <motion.a 
              href="/auth"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.a>
          </motion.div>

          {/* Demo Upload Progress */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-12"
            >
              <GlassMorphismCard className="max-w-md mx-auto">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Processing Sample Bank Statement</h3>
                  <p className="text-sm text-gray-600">Analyzing 247 transactions with AI...</p>
                </div>
                <ProgressBar 
                  progress={uploadProgress} 
                  animated={true}
                  showLabel={true}
                />
              </GlassMorphismCard>
            </motion.div>
          )}
        </div>

        {/* Hero Stats */}
        <StaggeredReveal staggerDelay={0.2}>
          {[
            { value: "500+", label: "Finance Companies", color: "text-blue-600" },
            { value: "1M+", label: "Documents Processed", color: "text-purple-600" },
            { value: "99.9%", label: "Accuracy Rate", color: "text-green-600" },
            { value: "30min", label: "Average Analysis Time", color: "text-orange-600" }
          ].map((stat, index) => (
            <AnimatedCard 
              key={index}
              className="text-center p-6 bg-white/80 backdrop-blur-sm"
              delay={index * 0.1}
            >
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </AnimatedCard>
          ))}
        </StaggeredReveal>
      </section>

      {/* Problem & Solution */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Problem Finance Companies Face
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">Manual analysis takes 3-5 days per document</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">Password-protected PDFs are impossible to process</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">Human errors in financial data analysis</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">No comprehensive fraud detection</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">Limited reporting and insights</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our AI-Powered Solution
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <p className="text-gray-600">Analyze documents in under 30 minutes</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <p className="text-gray-600">Smart password detection for bank PDFs</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <p className="text-gray-600">99.9% accuracy with ML algorithms</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <p className="text-gray-600">Advanced fraud detection and risk scoring</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <p className="text-gray-600">15+ comprehensive report modules</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 relative">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                <GradientText>Advanced Features</GradientText> Built for Finance Professionals
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every feature designed to streamline your financial analysis workflow and provide actionable insights
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <GlassMorphismCard 
                  className="text-center hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveFeature(index)}
                >
                  {/* Animated background overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  
                  <motion.div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white relative z-10`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {feature.icon}
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors relative z-10">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors relative z-10">
                    {feature.description}
                  </p>
                  
                  {activeFeature === index && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4 relative z-10"
                    />
                  )}
                  
                  {/* Floating particles effect */}
                  {activeFeature === index && (
                    <motion.div
                      className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full z-10"
                      animate={{
                        y: [-5, 5, -5],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </GlassMorphismCard>
              </ScrollReveal>
            ))}
          </div>

          {/* Interactive Feature Demo */}
          <ScrollReveal delay={0.8}>
            <div className="mt-16">
              <GlassMorphismCard className="max-w-4xl mx-auto p-8">
                <h3 className="text-2xl font-bold text-center mb-6">
                  <GradientText>Live Feature Preview</GradientText>
                </h3>
                <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <p>$ finscore-analyzer --analyze statement.pdf</p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      🔍 Detecting password protection... FOUND
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                    >
                      🔓 Attempting smart password cracking... SUCCESS
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.5 }}
                    >
                      📊 Processing 247 transactions... COMPLETE
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3 }}
                    >
                      🤖 AI Analysis: 2 anomalies detected, Risk Score: 23/100
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3.5 }}
                    >
                      ✅ Report generated: comprehensive_analysis.pdf
                    </motion.p>
                  </motion.div>
                </div>
              </GlassMorphismCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Report Modules */}
      <section id="reports" className="py-20 bg-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full"
                initial={{
                  x: Math.random() * 1200,
                  y: Math.random() * 800,
                }}
                animate={{
                  x: Math.random() * 1200,
                  y: Math.random() * 800,
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                <GradientText>Comprehensive Financial Reports</GradientText>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Generate detailed reports covering every aspect of financial analysis - 
                <span className="font-semibold text-blue-600"> beyond ProAnalyser capabilities</span>
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {reportModules.map((module, index) => (
              <ScrollReveal key={index} delay={index * 0.05}>
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                  }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-transparent hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                      {module}
                    </span>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* Sample Report Preview with Enhanced Animation */}
          <ScrollReveal delay={0.8}>
            <div className="mt-16">
              <GlassMorphismCard className="max-w-6xl mx-auto overflow-hidden">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    <GradientText>Live Report Preview</GradientText>
                  </h3>
                  <p className="text-gray-600">Experience the power of our advanced reporting system</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <motion.div 
                    className="report-header relative overflow-hidden"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatDelay: 3,
                        ease: "easeInOut"
                      }}
                    />
                    <h4 className="text-lg font-bold relative z-10">
                      Report Generated By FinScore Analyzer
                    </h4>
                    <p className="text-sm opacity-90 relative z-10">
                      Accuracy: 100% - All transactions verified with AI
                    </p>
                  </motion.div>

                  <div className="p-6">
                    <motion.div 
                      className="mb-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h5 className="font-semibold text-gray-700 mb-2">Account Summary</h5>
                      <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="grid md:grid-cols-2 gap-4 text-sm"
                        >
                          <div>
                            <p><strong>Account Number:</strong> XXXX1234567890123</p>
                            <p><strong>Bank Name:</strong> State Bank of India</p>
                          </div>
                          <div>
                            <p><strong>Account Type:</strong> Current, Savings</p>
                            <p><strong>Analysis Period:</strong> 1 year 4 months 21 days</p>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="overflow-x-auto"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Bank Name</th>
                            <th>Account No.</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>AI Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Statement_Q1_2024.pdf', 'Statement_Q2_2024.pdf'].map((filename, index) => (
                            <motion.tr
                              key={filename}
                              initial={{ x: -50, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 1.2 + index * 0.2 }}
                              className="hover:bg-gray-50"
                            >
                              <td className="font-mono text-xs">{filename}</td>
                              <td>State Bank of India</td>
                              <td className="font-mono">****1234567890123</td>
                              <td>Savings</td>
                              <td>
                                <motion.span 
                                  className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  ✓ Verified
                                </motion.span>
                              </td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
                                    {95 + index}
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  </div>
                </div>
              </GlassMorphismCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Finance Professionals</h2>
            <p className="text-xl text-gray-300">See what our customers say about FinScore Analyzer</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-800 p-6 rounded-xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                <GradientText>Simple, Transparent Pricing</GradientText>
              </h2>
              <p className="text-xl text-gray-600">Choose the plan that accelerates your business growth</p>
              
              {/* Pricing Toggle */}
              <motion.div 
                className="flex items-center justify-center mt-8 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-gray-600">Monthly</span>
                <motion.div 
                  className="w-14 h-8 bg-blue-600 rounded-full p-1 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="w-6 h-6 bg-white rounded-full"
                    animate={{ x: 24 }}
                  />
                </motion.div>
                <span className="text-gray-600">
                  Yearly <span className="text-green-600 font-semibold">(20% off)</span>
                </span>
              </motion.div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <ScrollReveal delay={0.2}>
              <AnimatedCard className="relative group">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                  <p className="text-gray-600 mb-6">Perfect for small finance companies</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">₹4,999</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      "50 documents/month",
                      "Basic analysis & reports",
                      "Email support",
                      "Password-protected PDFs"
                    ].map((feature, index) => (
                      <motion.li 
                        key={feature}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <NeonButton className="w-full" variant="secondary" href="/auth?mode=signup">
                    Start Free Trial
                  </NeonButton>
                </div>
              </AnimatedCard>
            </ScrollReveal>

            {/* Professional Plan */}
            <ScrollReveal delay={0.4}>
              <AnimatedCard className="relative group border-2 border-blue-500 scale-105">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <motion.span 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold"
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(59, 130, 246, 0.5)",
                        "0 0 40px rgba(59, 130, 246, 0.8)",
                        "0 0 20px rgba(59, 130, 246, 0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Most Popular
                  </motion.span>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                  <p className="text-gray-600 mb-6">For growing finance companies</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">₹14,999</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      "500 documents/month",
                      "Advanced AI insights",
                      "Priority phone support",
                      "Fraud detection",
                      "White-label reports"
                    ].map((feature, index) => (
                      <motion.li 
                        key={feature}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <NeonButton className="w-full" variant="primary" href="/auth?mode=signup">
                    Start Free Trial
                  </NeonButton>
                </div>
              </AnimatedCard>
            </ScrollReveal>

            {/* Enterprise Plan */}
            <ScrollReveal delay={0.6}>
              <AnimatedCard className="relative group">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <p className="text-gray-600 mb-6">For large financial institutions</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">₹49,999</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Unlimited documents",
                      "API access",
                      "Dedicated account manager",
                      "Custom integrations",
                      "On-premise deployment"
                    ].map((feature, index) => (
                      <motion.li 
                        key={feature}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <NeonButton className="w-full" variant="accent">
                    Contact Sales
                  </NeonButton>
                </div>
              </AnimatedCard>
            </ScrollReveal>
          </div>

          {/* Trust Indicators */}
          <ScrollReveal delay={0.8}>
            <div className="mt-16 text-center">
              <p className="text-gray-600 mb-6">Trusted by finance professionals worldwide</p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                {['Bank-Level Security', 'SOC 2 Compliant', 'GDPR Ready', '99.9% Uptime'].map((badge, index) => (
                  <motion.div
                    key={badge}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">{badge}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Financial Analysis?</h2>
          <p className="text-xl mb-8 opacity-90">Join 500+ finance companies already using FinScore Analyzer</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth?mode=signup" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free 14-Day Trial
            </a>
            <a href="/demo" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FinScore Analyzer</span>
              </div>
              <p className="text-gray-400 mb-4">Advanced financial document analysis for modern finance companies.</p>
              <div className="flex gap-4">
                <Globe className="w-5 h-5 text-gray-400" />
                <Lock className="w-5 h-5 text-gray-400" />
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FinScore Analyzer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>

  )
}
