import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
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

    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData?.user?.id) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
    }
    const userId = userData.user.id

    const { data: docs, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const bucketName = 'documents'
    const withUrls = await Promise.all(
      (docs || []).map(async (d) => {
        const { data: signed } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(d.storage_path, 60 * 60)
        return { ...d, signed_url: signed?.signedUrl }
      })
    )

    return NextResponse.json({ items: withUrls })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to load documents' }, { status: 500 })
  }
}
