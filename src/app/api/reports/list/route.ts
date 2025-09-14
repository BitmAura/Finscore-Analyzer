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
    if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { global: { headers: { Authorization: `Bearer ${jwt}` } } })
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to list reports' }, { status: 500 })
  }
}
