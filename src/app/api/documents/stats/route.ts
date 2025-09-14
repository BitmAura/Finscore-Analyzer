import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const authHeader = req.headers.get('authorization')
    const jwt = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    if (!jwt) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })

    // Documents count (RLS ensures ownership)
    const { count: documents_count, error: dErr } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
    if (dErr) throw dErr

    // Analysis count and averages (table might not yet exist)
    let analyses_count: number | null = null
    let avg_risk: number | null = null
    let avg_compliance: number | null = null
    try {
      const { count: aCount, error: aCountErr } = await supabase
        .from('document_analysis')
        .select('*', { count: 'exact', head: true })
      if (aCountErr) throw aCountErr
      analyses_count = aCount ?? 0

      const { data: scores } = await supabase
        .from('document_analysis')
        .select('risk_score,compliance_score')
        .limit(1000)

      if (scores && scores.length > 0) {
        const r = scores.map(s => s.risk_score).filter(x => typeof x === 'number') as number[]
        const c = scores.map(s => s.compliance_score).filter(x => typeof x === 'number') as number[]
        if (r.length) avg_risk = Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 100) / 100
        if (c.length) avg_compliance = Math.round((c.reduce((a, b) => a + b, 0) / c.length) * 100) / 100
      }
    } catch {
      // If the table/policies aren't ready, return nulls rather than failing
    }

    return NextResponse.json({
      documents_count: documents_count ?? 0,
      analyses_count,
      avg_risk,
      avg_compliance,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch stats' }, { status: 500 })
  }
}
