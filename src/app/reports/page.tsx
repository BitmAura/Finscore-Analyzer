"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import CreateReportWizard from '../../components/reports/CreateReportWizard'

export default function ReportsPage() {
  const { session } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [wizardOpen, setWizardOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!session?.access_token) return
      const res = await fetch('/api/documents/recent', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      const json = await res.json()
      if (res.ok) setItems(json.items || [])
    }
    load()
  }, [session?.access_token])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => setWizardOpen(true)}>Create New Report</button>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-600">No reports yet. Upload and process a document to see analyses here.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 px-3">File</th>
                <th className="py-2 px-3">Display</th>
                <th className="py-2 px-3">Account</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d: any) => (
                <tr key={d.id} className="border-t border-gray-100">
                  <td className="py-2 px-3">{d.filename}</td>
                  <td className="py-2 px-3">{d.display_name || '-'}</td>
                  <td className="py-2 px-3 text-gray-600">{d.account_label || '-'}</td>
                  <td className="py-2 px-3 text-gray-600">{d.doc_type}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs ${d.processing_status === 'complete' ? 'bg-green-100 text-green-700' : d.processing_status === 'processing' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                      {d.processing_status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <a href={`/reports/${d.id}`} className="text-blue-600 hover:underline">View Analysis</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {wizardOpen && (
        <CreateReportWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onDone={async () => {
          if (!session?.access_token) return
          const res = await fetch('/api/documents/recent', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          const json = await res.json()
          if (res.ok) setItems(json.items || [])
        }} />
      )}
    </div>
  )
}
