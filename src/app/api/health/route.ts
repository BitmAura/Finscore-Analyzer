import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Simple readiness check (without hitting DB)
    const ok = hasUrl && hasAnon

    return NextResponse.json({
      ok,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: hasUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnon,
      },
      hint: ok
        ? 'Supabase client can initialize. Try visiting /auth if you have providers configured.'
        : 'Set the missing variables in .env.local and restart the dev server.'
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
