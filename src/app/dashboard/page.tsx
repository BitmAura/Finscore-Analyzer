'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Bell,
  Search
} from 'lucide-react'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { GlassMorphismCard } from '../../components/ui/AdvancedComponents'
import FileUpload from '../../components/ui/FileUpload'
import { useAuth } from '../../hooks/useAuth'
import CreateReportWizard from '../../components/reports/CreateReportWizard'

export default function Dashboard() {
  // File upload handler wired with auth token
  const { user, profile, signOut, session } = useAuth()
  const handleUpload = async (
    files: File[],
    password?: string,
    meta?: { displayName?: string; accountLabel?: string; perFile?: Array<{ displayName?: string; accountLabel?: string }> }
  ) => {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    if (password) form.append('password', password)
    if (meta?.displayName) form.append('display_name', meta.displayName)
    if (meta?.accountLabel) form.append('account_label', meta.accountLabel)
    if (meta?.perFile) form.append('per_file_meta', JSON.stringify(meta.perFile))
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: form,
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      })
      const json = await res.json()
      if (!res.ok) {
        console.error('Upload failed:', json)
        alert(`Upload failed: ${json.error || 'Unknown error'}`)
      } else {
        console.log('Uploaded:', json)
        alert('Upload successful!')
      }
    } catch (e: any) {
      console.error(e)
      alert(`Upload error: ${e.message}`)
    }
  };
  const [recent, setRecent] = React.useState<any[]>([])
  const [wizardOpen, setWizardOpen] = React.useState(false)
  React.useEffect(() => {
    const load = async () => {
      if (!session?.access_token) return
      const res = await fetch('/api/documents/recent', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      const json = await res.json()
      if (res.ok) setRecent(json.items || [])
    }
    load()
  }, [session?.access_token])

  const handleSignOut = async () => {
    await signOut()
  }

  // Realistic welcome: show user info and avoid fake metrics. We'll hydrate live stats as available.
  const [stats, setStats] = React.useState([
    { title: 'Documents', value: '-', change: '', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { title: 'Analyses', value: '-', change: '', icon: BarChart3, color: 'from-green-500 to-green-600' },
    { title: 'Avg Risk', value: '-', change: '', icon: Upload, color: 'from-purple-500 to-purple-600' },
    { title: 'Avg Compliance', value: '-', change: '', icon: Settings, color: 'from-orange-500 to-orange-600' },
  ])

  React.useEffect(() => {
    const loadStats = async () => {
      if (!session?.access_token) return
      try {
        const res = await fetch('/api/documents/stats', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        const json = await res.json()
        if (res.ok) {
          setStats([
            { title: 'Documents', value: String(json.documents_count ?? '-'), change: '', icon: FileText, color: 'from-blue-500 to-blue-600' },
            { title: 'Analyses', value: String(json.analyses_count ?? '-'), change: '', icon: BarChart3, color: 'from-green-500 to-green-600' },
            { title: 'Avg Risk', value: json.avg_risk != null ? String(json.avg_risk) : '-', change: '', icon: Upload, color: 'from-purple-500 to-purple-600' },
            { title: 'Avg Compliance', value: json.avg_compliance != null ? String(json.avg_compliance) : '-', change: '', icon: Settings, color: 'from-orange-500 to-orange-600' },
          ])
        }
      } catch (e) {
        // leave defaults
      }
    }
    loadStats()
  }, [session?.access_token])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FinScore
                </h1>
                <nav className="hidden md:flex ml-10 space-x-8">
                  <a href="/dashboard" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="/documents" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Documents
                  </a>
                  <a href="/reports" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Reports
                  </a>
                  <a href="/analytics" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Analytics
                  </a>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{profile?.full_name || user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile?.subscription_tier} Plan</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-gray-600">
              Here's an overview of your financial analysis dashboard
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassMorphismCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className={`text-sm ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </GlassMorphismCard>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileUpload onUpload={handleUpload} />

              <button onClick={() => setWizardOpen(true)} className="block w-full text-left">
                <GlassMorphismCard className="p-6 hover:bg-green-50/50 transition-all cursor-pointer group">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Generate Report</h4>
                    <p className="text-gray-600">Create comprehensive financial analysis reports</p>
                  </div>
                </GlassMorphismCard>
              </button>

              <a href="/reports" className="block">
                <GlassMorphismCard className="p-6 hover:bg-purple-50/50 transition-all cursor-pointer group">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">View Reports</h4>
                    <p className="text-gray-600">Access your existing analysis reports and insights</p>
                  </div>
                </GlassMorphismCard>
              </a>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Uploads</h3>
            <GlassMorphismCard className="p-6">
              {recent.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No recent uploads</h4>
                  <p className="text-gray-600 mb-4">Upload a document to get started.</p>
                  <FileUpload onUpload={handleUpload} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2">File</th>
                        <th className="py-2">Display Name</th>
                        <th className="py-2">Account</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Size</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((d) => (
                        <tr key={d.id} className="border-t border-gray-100">
                          <td className="py-2 text-gray-900">{d.filename}</td>
                          <td className="py-2 text-gray-900">{d.display_name || '-'}</td>
                          <td className="py-2 text-gray-600">{d.account_label || '-'}</td>
                          <td className="py-2 text-gray-600">{d.doc_type}</td>
                          <td className="py-2 text-gray-600">{Math.round((d.file_size || 0) / 1024)} KB</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${d.processing_status === 'complete' ? 'bg-green-100 text-green-700' : d.processing_status === 'processing' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                              {d.processing_status}
                            </span>
                          </td>
                          <td className="py-2 text-right space-x-2">
                            <a href={d.signed_url} target="_blank" className="text-blue-600 hover:underline">View File</a>
                            <a href={`/reports/${d.id}`} className="text-indigo-600 hover:underline ml-2">View Analysis</a>
                            <button
                              className="text-purple-600 hover:underline"
                              onClick={async () => {
                                if (!session?.access_token) return
                                await fetch('/api/documents/process', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${session.access_token}`
                                  },
                                  body: JSON.stringify({ id: d.id })
                                })
                                // reload
                                const res = await fetch('/api/documents/recent', {
                                  headers: { Authorization: `Bearer ${session.access_token}` }
                                })
                                const json = await res.json()
                                if (res.ok) setRecent(json.items || [])
                              }}
                            >
                              Process
                            </button>
                            <button
                              className="text-red-600 hover:underline"
                              onClick={async () => {
                                if (!session?.access_token) return
                                await fetch('/api/documents/delete', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${session.access_token}`
                                  },
                                  body: JSON.stringify({ id: d.id, storage_path: d.storage_path })
                                })
                                const res = await fetch('/api/documents/recent', {
                                  headers: { Authorization: `Bearer ${session.access_token}` }
                                })
                                const json = await res.json()
                                if (res.ok) setRecent(json.items || [])
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassMorphismCard>
          </motion.div>
        </main>
        {wizardOpen && (
          <CreateReportWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onDone={async () => {
            // refresh recent after report created
            if (!session?.access_token) return
            const res = await fetch('/api/documents/recent', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            })
            const json = await res.json()
            if (res.ok) setRecent(json.items || [])
          }} />
        )}
      </div>
    </ProtectedRoute>
  )
}