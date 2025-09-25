'use client'

import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User,
  ArrowRight,
  Tag,
  TrendingUp,
  BarChart,
  Shield,
  Zap,
  FileText,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'

export default function BlogPage() {
  const featuredPost = {
    id: 1,
    title: "The Future of AI in Financial Document Analysis",
    excerpt: "Explore how artificial intelligence is revolutionizing the way we analyze financial documents, from automated data extraction to predictive insights.",
    content: "Financial institutions are increasingly turning to AI-powered solutions to streamline their document analysis processes...",
    author: "Sarah Johnson",
    authorRole: "CEO & Co-Founder",
    date: "2025-01-15",
    readTime: "8 min read",
    category: "AI & Technology",
    image: "/api/placeholder/800/400",
    featured: true
  }

  const blogPosts = [
    {
      id: 2,
      title: "10 Best Practices for Financial Compliance in 2025",
      excerpt: "Stay ahead of regulatory changes with these essential compliance strategies for modern financial institutions.",
      author: "Michael Chen",
      authorRole: "CTO",
      date: "2025-01-12",
      readTime: "6 min read",
      category: "Compliance",
      image: "/api/placeholder/400/250"
    },
    {
      id: 3,
      title: "How to Reduce Document Processing Time by 90%",
      excerpt: "Learn the strategies and tools that leading finance teams use to dramatically speed up their document workflows.",
      author: "Emily Rodriguez",
      authorRole: "Head of Product",
      date: "2025-01-10",
      readTime: "5 min read",
      category: "Productivity",
      image: "/api/placeholder/400/250"
    },
    {
      id: 4,
      title: "Understanding Risk Assessment in Digital Finance",
      excerpt: "A comprehensive guide to modern risk assessment methodologies and how technology is changing the landscape.",
      author: "David Kim",
      authorRole: "Lead Data Scientist",
      date: "2025-01-08",
      readTime: "7 min read",
      category: "Risk Management",
      image: "/api/placeholder/400/250"
    },
    {
      id: 5,
      title: "The ROI of Automated Financial Analysis",
      excerpt: "Discover the measurable benefits of implementing automated analysis tools in your financial operations.",
      author: "Sarah Johnson",
      authorRole: "CEO & Co-Founder",
      date: "2025-01-05",
      readTime: "6 min read",
      category: "Business Strategy",
      image: "/api/placeholder/400/250"
    },
    {
      id: 6,
      title: "Security Best Practices for Financial Data",
      excerpt: "Essential security measures every financial institution should implement to protect sensitive data.",
      author: "Michael Chen",
      authorRole: "CTO",
      date: "2025-01-03",
      readTime: "8 min read",
      category: "Security",
      image: "/api/placeholder/400/250"
    },
    {
      id: 7,
      title: "Machine Learning Models for Fraud Detection",
      excerpt: "How advanced ML algorithms are helping financial institutions identify and prevent fraudulent activities.",
      author: "David Kim",
      authorRole: "Lead Data Scientist",
      date: "2025-01-01",
      readTime: "9 min read",
      category: "AI & Technology",
      image: "/api/placeholder/400/250"
    }
  ]

  const categories = [
    { name: "All", count: 7, active: true },
    { name: "AI & Technology", count: 2, active: false },
    { name: "Compliance", count: 1, active: false },
    { name: "Security", count: 1, active: false },
    { name: "Business Strategy", count: 1, active: false },
    { name: "Risk Management", count: 1, active: false },
    { name: "Productivity", count: 1, active: false }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI & Technology": return <Zap className="h-4 w-4" />
      case "Compliance": return <FileText className="h-4 w-4" />
      case "Security": return <Shield className="h-4 w-4" />
      case "Business Strategy": return <TrendingUp className="h-4 w-4" />
      case "Risk Management": return <BarChart className="h-4 w-4" />
      default: return <Tag className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AI & Technology": return "bg-purple-100 text-purple-800"
      case "Compliance": return "bg-blue-100 text-blue-800"
      case "Security": return "bg-red-100 text-red-800"
      case "Business Strategy": return "bg-green-100 text-green-800"
      case "Risk Management": return "bg-orange-100 text-orange-800"
      case "Productivity": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinScore
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/security" className="text-gray-600 hover:text-gray-900">Security</Link>
              <Link href="/auth">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              FinScore{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Insights, trends, and best practices in financial technology and document analysis. 
              Stay updated with the latest in fintech innovation.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 py-3"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-8">Featured Article</h2>
            
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto bg-gradient-to-br from-blue-600 to-purple-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center p-8">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-80" />
                      <p className="text-blue-100">Featured Article Image</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 lg:p-12">
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge className={getCategoryColor(featuredPost.category)}>
                      {getCategoryIcon(featuredPost.category)}
                      <span className="ml-1">{featuredPost.category}</span>
                    </Badge>
                    <span className="text-sm text-gray-500">Featured</span>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 text-lg">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{featuredPost.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{featuredPost.readTime}</span>
                      </div>
                    </div>
                    
                    <Button className="group">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category.active
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold">Latest Articles</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-t-lg">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        {getCategoryIcon(post.category)}
                        <p className="text-blue-100 text-sm mt-2">Article Image</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(post.category)}>
                        {getCategoryIcon(post.category)}
                        <span className="ml-1">{post.category}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <FileText className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest insights on financial technology 
              and document analysis delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto flex space-x-4">
              <Input 
                placeholder="Enter your email" 
                className="bg-white text-gray-900"
              />
              <Button variant="secondary" size="lg">
                Subscribe
              </Button>
            </div>
            <p className="text-blue-100 mt-4 text-sm">
              Join 5,000+ finance professionals. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FS</span>
                </div>
                <span className="text-xl font-bold">FinScore</span>
              </div>
              <p className="text-gray-400">
                Advanced financial analysis platform powered by AI.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/demo">Demo</Link></li>
                <li><Link href="/integrations">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/press">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/security">Security</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 FinScore Analyzer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}