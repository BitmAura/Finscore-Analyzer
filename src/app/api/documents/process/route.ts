import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { tryParseTransactionsFromCsv, tryParseTransactionsFromXlsx, computeGstMetricsFromTransactions } from '../../../../lib/analysis/gst'
import { computeBankMetrics } from '../../../../lib/analysis/bank'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const authHeader = req.headers.get('authorization')
    const jwt = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    if (!jwt) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })

    // Mark processing
    let { error } = await supabase
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Load document metadata
    const { data: doc } = await supabase
      .from('documents')
      .select('id,user_id,filename,file_type,file_size,doc_type,created_at,storage_path')
      .eq('id', id)
      .single()

    // Default metrics object
  let metrics: any = { gst: { payments_count: 0, refunds_count: 0, months_with_activity: 0, total_payments: 0, total_refunds: 0 }, bank: null }
  let summary: any = { filename: doc?.filename, message: 'Analysis complete' }
  let risk_score: number | null = null
  let compliance_score: number | null = null

    try {
      // Download file from storage
      if (!doc?.storage_path) throw new Error('Missing storage path')
      const { data: dl, error: dlErr } = await supabase.storage.from('documents').download(doc.storage_path)
      if (dlErr) throw dlErr
      const arrayBuffer = await dl!.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const type = (doc?.file_type || '').toLowerCase()
      let transactions: any[] = []
      if (type.includes('csv')) {
        transactions = await tryParseTransactionsFromCsv(buffer)
      } else if (type.includes('sheet') || type.includes('excel') || doc?.filename?.match(/\.xlsx?$/i)) {
        transactions = tryParseTransactionsFromXlsx(buffer)
      } else {
        // Unsupported type for parsing; keep default metrics
        summary.message = 'Analysis complete (basic)'
      }

      if (transactions.length) {
        const gst = computeGstMetricsFromTransactions(transactions)
        metrics.gst = gst
        const bank = computeBankMetrics(transactions)
        metrics.bank = bank
        risk_score = bank.risk_score
        compliance_score = bank.compliance_score
        summary.transactions_parsed = transactions.length
      }
    } catch (e: any) {
      // Keep placeholder metrics, but include error in summary for debugging
      summary.error = e?.message || 'Parsing failed'
    }

    const { error: aErr } = await supabase.from('document_analysis').insert({
      document_id: id,
      user_id: doc?.user_id,
      summary,
      metrics,
      risk_score,
      compliance_score,
    })
    if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 })

    // Mark complete (for now)
    ;({ error } = await supabase
      .from('documents')
      .update({ processing_status: 'complete' })
      .eq('id', id))
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Processing failed' }, { status: 500 })
  }
}
