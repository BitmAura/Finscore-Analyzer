import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 })
    }

    const authHeader = req.headers.get('authorization')
    const jwt = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    if (!jwt) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })

    const { data: doc, error: dErr } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: analysis } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('document_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: signed } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 60 * 60)

    const document = { ...doc, signed_url: signed?.signedUrl }
    return NextResponse.json({ document, analysis })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to load document' }, { status: 500 })
  }
}
