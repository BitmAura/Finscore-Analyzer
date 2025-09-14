"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { GlassMorphismCard } from '../../../components/ui/AdvancedComponents'
import { useAuth } from '../../../hooks/useAuth'

export default function ReportDetailPage() {
  const params = useParams() as { id?: string }
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [doc, setDoc] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    const run = async () => {
      if (!params?.id || !session?.access_token) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/documents/${params.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch analysis')
        setDoc(json.document)
        setAnalysis(json.analysis)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params?.id, session?.access_token])

  const triggerProcess = async () => {
    if (!session?.access_token || !params?.id) return
    await fetch('/api/documents/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ id: params.id })
    })
    // refetch
    const res = await fetch(`/api/documents/${params.id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    const json = await res.json()
    if (res.ok) {
      setDoc(json.document)
      setAnalysis(json.analysis)
    }
  }

  if (!params?.id) return <div className="p-6">Invalid report id</div>
  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  const gst = analysis?.metrics?.gst
  const bank = analysis?.metrics?.bank

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <GlassMorphismCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{doc?.display_name || doc?.filename}</h1>
              <p className="text-gray-600 text-sm">{doc?.account_label ? `Account: ${doc.account_label} • ` : ''}Type: {doc?.doc_type} • Status: {doc?.processing_status}</p>
            </div>
            <div className="space-x-2">
              <a href={doc?.signed_url} target="_blank" className="px-3 py-2 bg-blue-600 text-white rounded">View File</a>
              <button onClick={triggerProcess} className="px-3 py-2 bg-purple-600 text-white rounded">Process</button>
            </div>
          </div>
        </GlassMorphismCard>

        <GlassMorphismCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">GST Metrics</h2>
          {!gst ? (
            <p className="text-gray-600">No GST metrics yet. Click Process to analyze.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Payments Count</p>
                <p className="text-xl font-bold">{gst.payments_count ?? '-'}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Refunds Count</p>
                <p className="text-xl font-bold">{gst.refunds_count ?? '-'}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Months with Activity</p>
                <p className="text-xl font-bold">{gst.months_with_activity ?? '-'}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-xl font-bold">₹{(gst.total_payments ?? 0).toLocaleString()}</p>
              </div>
            </div>
          )}
        </GlassMorphismCard>

        <GlassMorphismCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">Bank Metrics</h2>
          {!bank ? (
            <p className="text-gray-600">No bank metrics yet. Click Process to analyze.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Total Credits</p>
                <p className="text-xl font-bold">₹{(bank.totals?.total_credits ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Total Debits</p>
                <p className="text-xl font-bold">₹{(bank.totals?.total_debits ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Salary Credits</p>
                <p className="text-xl font-bold">₹{(bank.totals?.salary_credits ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">EMI Debits</p>
                <p className="text-xl font-bold">₹{(bank.totals?.emi_debits ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">ATM Withdrawals</p>
                <p className="text-xl font-bold">₹{(bank.totals?.atm_withdrawals ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Cheque Returns</p>
                <p className="text-xl font-bold">{bank.totals?.cheque_returns ?? 0}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">EMI/Income Ratio</p>
                <p className="text-xl font-bold">{bank.emi_to_income_ratio != null ? bank.emi_to_income_ratio.toFixed(2) : '-'}</p>
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className="text-xl font-bold">{analysis?.risk_score ?? '-'}</p>
              </div>
            </div>
          )}
        </GlassMorphismCard>
      </div>
    </div>
  )
}
