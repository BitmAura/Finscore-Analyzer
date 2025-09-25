'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GlassMorphismCard, NeonButton } from '../ui/AdvancedComponents'
import FileUpload from '../ui/FileUpload'
import { useAuth } from '../../hooks/useAuth'

type ReportType = 'bank' | 'gst'

interface Props {
  open: boolean
  onClose: () => void
  onDone?: (reportId?: string) => void
}

export default function CreateReportWizard({ open, onClose, onDone }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [reportName, setReportName] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [reportType, setReportType] = useState<ReportType | ''>('')
  const [accounts, setAccounts] = useState<Array<{ key: string; files: File[] }>>([{ key: 'Bank Account', files: [] }])
  const { session } = useAuth()

  if (!open) return null

  const addAccount = () => setAccounts([...accounts, { key: 'Bank Account', files: [] }])
  const removeAccount = (idx: number) => setAccounts(accounts.filter((_, i) => i !== idx))

  const handleUploadCapture = (idx: number) => (files: File[], _password?: string) => {
    const next = [...accounts]; next[idx] = { ...next[idx], files }; setAccounts(next)
  }

  const disabledNext = !reportName || !referenceId || !reportType

  const startAnalysis = async () => {
    try {
      // Upload files for each account first
      for (let i = 0; i < accounts.length; i++) {
        const acct = accounts[i]
        if (!acct.files.length) continue
        const form = new FormData()
        acct.files.forEach((f: File) => form.append('files', f))
        form.append('type', reportType === 'bank' ? 'bank' : 'gst')
        form.append('account_label', `${acct.key} ${i + 1}`)
        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: form,
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        })
        if (!res.ok) {
          const j = await res.json(); throw new Error(j.error || 'Upload failed')
        }
      }

      // Optionally, fetch recent and trigger processing of new bank docs (simple approach)
      const res = await fetch('/api/documents/recent', {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      })
      const json = await res.json()
      const docs = (json.items || []).filter((d: any) => d.doc_type === (reportType === 'bank' ? 'bank' : 'gst'))
      if (docs.length) {
        // process newest doc per account label
        const newestPerLabel: Record<string, any> = {}
        for (const d of docs) {
          const key = d.account_label || 'default'
          if (!newestPerLabel[key]) newestPerLabel[key] = d
        }
        for (const d of Object.values(newestPerLabel)) {
          await fetch('/api/documents/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({ id: (d as any).id })
          })
        }
      }

      onDone?.()
      onClose()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <GlassMorphismCard className="p-6">
            <h2 className="text-2xl font-bold mb-1">Create New Report</h2>
            <p className="text-gray-600 mb-4">Enter the details of the new report here.</p>

            {step === 1 && (
              <div className="space-y-3">
                <input
                  placeholder="Report Name"
                  className="w-full px-3 py-2 border rounded"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
                <input
                  placeholder="Reference ID"
                  className="w-full px-3 py-2 border rounded"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                />
                <select
                  className="w-full px-3 py-2 border rounded text-gray-700"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                >
                  <option value="">Select Report Type</option>
                  <option value="bank">Bank Statement Analyser</option>
                  <option value="gst">GST Statement Analyser</option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
                  <button className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50" disabled={disabledNext} onClick={() => setStep(2)}>Next</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {accounts.map((acct, idx) => (
                  <div key={idx} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        className="text-base font-medium px-2 py-1 border rounded"
                        value={acct.key}
                        onChange={(e) => {
                          const next = [...accounts]; next[idx] = { ...next[idx], key: e.target.value }; setAccounts(next)
                        }}
                      />
                      <div className="flex items-center gap-2">
                        {accounts.length > 1 && (
                          <button className="p-2 text-gray-600 hover:text-red-600" onClick={() => removeAccount(idx)} title="Remove">
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    <FileUpload onUpload={(files: File[], password?: string) => handleUploadCapture(idx)(files, password)} />
                  </div>
                ))}
                <button onClick={addAccount} className="px-3 py-2 border rounded">+ Add new account</button>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="px-4 py-2 rounded border" onClick={() => setStep(1)}>Back</button>
                  <NeonButton onClick={startAnalysis}>Analyse</NeonButton>
                </div>
              </div>
            )}
          </GlassMorphismCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
