import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, reference_id, report_type } = await req.json()
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const authHeader = req.headers.get('authorization')
    const jwt = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { global: { headers: { Authorization: `Bearer ${jwt}` } } })
    const { data: u } = await supabase.auth.getUser()
    if (!u?.user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    const user_id = u.user.id
    const { data, error } = await supabase.from('reports').insert({ name, reference_id, report_type, user_id }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ report: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create report' }, { status: 500 })
  }
}
