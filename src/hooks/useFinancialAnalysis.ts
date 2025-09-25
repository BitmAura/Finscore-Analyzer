/**
 * React Hook for Financial Analysis
 * 
 * Simple hook to handle document upload and analysis in your React components.
 * This replaces the complex agentic AI interface with something practical.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

interface AnalysisState {
  isUploading: boolean
  isAnalyzing: boolean
  analysisId: string | null
  result: any | null
  error: string | null
  progress: number
}

interface UseFinancialAnalysisOptions {
  onComplete?: (result: any) => void
  onError?: (error: string) => void
  onProgress?: (progress: number) => void
  pollInterval?: number
  endpoints?: {
    start?: string // POST to start analysis
    status?: string // GET status by analysisId
    userAnalytics?: string // GET analytics by userId
  }
}

export function useFinancialAnalysis(options: UseFinancialAnalysisOptions = {}): {
  isLoading: boolean
  isUploading: boolean
  isAnalyzing: boolean
  progress: number
  result: any | null
  error: string | null
  analysisId: string | null

  // Actions
  analyzeDocuments: (files: File[], passwords: string[], userId: string, reportFormat?: 'basic' | 'comprehensive') => Promise<void>
  pollDocumentStatus: (documentIdOrAnalysisId: string) => Promise<void>
  cancelAnalysis: () => void
  reset: () => void
  getUserAnalytics: (userId: string) => Promise<any | null>
  getAnalysisJobs: (userId: string) => Promise<any | null>
  getKpis: (userId: string) => Promise<any | null>
} {
  const [state, setState] = useState<AnalysisState>({
    isUploading: false,
    isAnalyzing: false,
    analysisId: null,
    result: null,
    error: null,
    progress: 0
  })

  const {
    onComplete,
    onError,
    onProgress,
    pollInterval = 2000,
    endpoints = {}
  } = options

  const baseEndpoint = endpoints.start ?? '/api/v1/analysis/bank-statement'
  const statusEndpoint = endpoints.status ?? '/api/v1/analysis/status'
  const userAnalyticsEndpoint = endpoints.userAnalytics ?? '/api/analytics/summary'
  const jobsEndpoint = '/api/v1/analysis-jobs' // New endpoint
  const kpisEndpoint = '/api/v1/analytics/kpis' // New endpoint

  // Refs to hold latest callbacks to avoid needing them in dependency arrays
  const onCompleteRef = useRef<typeof onComplete | undefined>(onComplete)
  const onErrorRef = useRef<typeof onError | undefined>(onError)
  const onProgressRef = useRef<typeof onProgress | undefined>(onProgress)

  // Abort and timer refs to support cancellation
  const uploadAbortRef = useRef<AbortController | null>(null)
  const pollAbortRef = useRef<{ aborted: boolean }>({ aborted: false })
  const pollTimerRef = useRef<number | null>(null)

  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  useEffect(() => { onErrorRef.current = onError }, [onError])
  useEffect(() => { onProgressRef.current = onProgress }, [onProgress])

  // Ensure we clear timers on unmount
  useEffect(() => {
    const timerRef = pollTimerRef;
    const abortRef = pollAbortRef;
    const uploadRef = uploadAbortRef;

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      // mark polling aborted
      if (abortRef.current) {
        abortRef.current.aborted = true
      }
      // abort any pending upload
      if (uploadRef.current) uploadRef.current.abort()
    }
  }, [])

  const setProgress = (p: number) => {
    setState(prev => ({ ...prev, progress: p }))
    try { onProgressRef.current?.(p) } catch (e) { /* swallow */ }
  }

  // Helper to advance progress by delta based on previous state
  const advanceProgress = (delta: number) => {
    setState(prev => {
      const next = Math.min(99, prev.progress + delta)
      try { onProgressRef.current?.(next) } catch (e) { /* swallow */ }
      return { ...prev, progress: next }
    })
  }

  const pollForCompletion = useCallback(async (analysisId: string) => {
    const startTime = Date.now()
    const maxWaitTime = 5 * 60 * 1000 // 5 minutes
    pollAbortRef.current.aborted = false

    const poll = async () => {
      if (pollAbortRef.current.aborted) return
      try {
        const res = await fetch(`${statusEndpoint}/${analysisId}`)
        const result = await res.json()

        if (result.status === 'completed') {
          try {
            setState(prev => ({ ...prev, isAnalyzing: false, result: result.data, progress: 100 }))
            onCompleteRef.current?.(result.data)
            setProgress(100)
          } catch (error) {
            console.error('Error during completion handling:', error)
            setState(prev => ({ ...prev, isAnalyzing: false, error: 'Error during completion handling' }))
          }
          return
        }

        if (result.status === 'failed') {
          setState(prev => ({ ...prev, isAnalyzing: false, error: result.error || 'Analysis failed' }))
          onErrorRef.current?.(result.error || 'Analysis failed')
          return
        }

        if (Date.now() - startTime > maxWaitTime) {
          setState(prev => ({ ...prev, isAnalyzing: false, error: 'Analysis timeout' }))
          onErrorRef.current?.('Analysis timeout')
          return
        }

        // advance a bit
        advanceProgress(5)
        // schedule next poll
        pollTimerRef.current = window.setTimeout(poll, pollInterval)
      } catch (err: any) {
        const msg = err instanceof Error ? err.message : 'Polling failed'
        setState(prev => ({ ...prev, isAnalyzing: false, error: msg }))
        onErrorRef.current?.(msg)
      }
    }

    await poll()
  }, [pollInterval, statusEndpoint])

  const cancelAnalysis = useCallback(() => {
    // Abort upload
    uploadAbortRef.current?.abort()
    uploadAbortRef.current = null
    // Stop polling
    pollAbortRef.current.aborted = true
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
    setState(prev => ({ ...prev, isUploading: false, isAnalyzing: false }))
  }, [])

  const analyzeDocuments = useCallback(async (
    files: File[],
    passwords: string[],
    userId: string,
    reportName: string,
    referenceId: string,
    reportType: string,
    reportFormat: 'basic' | 'comprehensive' = 'comprehensive'
  ) => {
    // Reset previous aborts
    pollAbortRef.current.aborted = false
    if (uploadAbortRef.current) uploadAbortRef.current.abort()
    uploadAbortRef.current = new AbortController()

    setState(prev => ({ ...prev, isUploading: true, error: null, progress: 0 }))
    setProgress(0)

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file));
      passwords.forEach(password => formData.append('passwords', password));
      formData.append('userId', userId)
      formData.append('reportName', reportName)
      formData.append('referenceId', referenceId)
      formData.append('reportType', reportType)
      formData.append('reportFormat', reportFormat)

      const res = await fetch(baseEndpoint, {
        method: 'POST',
        body: formData,
        signal: uploadAbortRef.current.signal
      })

      const uploadResult = await res.json()
      if (res.status !== 200) {
        setState(prev => ({ ...prev, isUploading: false, isAnalyzing: false, error: uploadResult.error }))
        onErrorRef.current?.(uploadResult.error)
        return
      }

      setState(prev => ({ ...prev, isUploading: false, isAnalyzing: true, analysisId: uploadResult.analysisId, progress: 25 }))
      setProgress(25)

      await pollForCompletion(uploadResult.analysisId)
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // canceled - do not treat as error
        setState(prev => ({ ...prev, isUploading: false, isAnalyzing: false }))
        return
      }
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setState(prev => ({ ...prev, isUploading: false, isAnalyzing: false, error: errorMessage }))
      onErrorRef.current?.(errorMessage)
    }
  }, [baseEndpoint, pollForCompletion])

  const reset = useCallback(() => {
    // cancel any ongoing operations
    cancelAnalysis()
    setState({ isUploading: false, isAnalyzing: false, analysisId: null, result: null, error: null, progress: 0 })
  }, [cancelAnalysis])

  const getUserAnalytics = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${userAnalyticsEndpoint}?userId=${encodeURIComponent(userId)}`)
      const result = await response.json()
      if (result.success) return { recentAnalyses: result.recentAnalyses, analytics: result.analytics }
      throw new Error('Failed to fetch user analytics')
    } catch (error) {
      console.error('Failed to fetch user analytics:', error)
      setState(prev => ({ ...prev, error: 'User analytics fetch failed' }))
    }
  }, [userAnalyticsEndpoint])

  const getAnalysisJobs = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${jobsEndpoint}?userId=${encodeURIComponent(userId)}`)
      const result = await response.json()
      return result;
    } catch (error) {
      console.error('Failed to fetch analysis jobs:', error)
      setState(prev => ({ ...prev, error: 'Analysis jobs fetch failed' }))
    }
  }, [jobsEndpoint])

  const getKpis = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${kpisEndpoint}?userId=${encodeURIComponent(userId)}`)
      const result = await response.json()
      return result;
    } catch (error) {
      console.error('Failed to fetch KPIs:', error)
      setState(prev => ({ ...prev, error: 'KPIs fetch failed' }))
    }
  }, [kpisEndpoint])

  const pollDocumentStatus = useCallback(async (documentIdOrAnalysisId: string) => {
    // Start polling assuming the backend can accept a documentId or analysisId on the status endpoint
    setState(prev => ({ ...prev, isAnalyzing: true, analysisId: documentIdOrAnalysisId }))
    setProgress(30)
    await pollForCompletion(documentIdOrAnalysisId)
  }, [pollForCompletion])

  return {
    isLoading: state.isUploading || state.isAnalyzing,
    isUploading: state.isUploading,
    isAnalyzing: state.isAnalyzing,
    progress: state.progress,
    result: state.result,
    error: state.error,
    analysisId: state.analysisId,

    analyzeDocuments,
    pollDocumentStatus,
    cancelAnalysis,
    reset,
    getUserAnalytics,
    getAnalysisJobs,
    getKpis
  }
}
