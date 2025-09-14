import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const authHeader = req.headers.get('authorization')
    const jwt = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { global: { headers: { Authorization: `Bearer ${jwt}` } } })

    const { data: report, error: rErr } = await supabase.from('reports').select('*').eq('id', id).single()
    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: links, error: lErr } = await supabase
      .from('report_documents')
      .select('document_id, account_label')
      .eq('report_id', id)
    if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 })

    const docIds = (links || []).map(l => l.document_id)
    let documents: any[] = []
    if (docIds.length) {
      const { data: docs, error: dErr } = await supabase.from('documents').select('*').in('id', docIds)
      if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 })
      const { data: analyses } = await supabase
        .from('document_analysis')
        .select('*')
        .in('document_id', docIds)
        .order('created_at', { ascending: false })

      const latestMap: Record<string, any> = {}
      for (const a of analyses || []) if (!latestMap[a.document_id]) latestMap[a.document_id] = a

      const bucket = 'documents'
      documents = await Promise.all((docs || []).map(async (d) => {
        const link = (links || []).find(l => l.document_id === d.id)
        const { data: s } = await supabase.storage.from(bucket).createSignedUrl(d.storage_path, 60 * 60)
        return { ...d, account_label: link?.account_label || d.account_label, signed_url: s?.signedUrl, latest_analysis: latestMap[d.id] }
      }))
    }

    return NextResponse.json({ report, documents })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to load report' }, { status: 500 })
  }
}
