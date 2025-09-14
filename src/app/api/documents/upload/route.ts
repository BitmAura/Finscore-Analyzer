import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 })
    }
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const password = (formData.get('password') as string) || undefined
    const docType = (formData.get('type') as string) || 'unknown'
    const displayName = (formData.get('display_name') as string) || undefined
    const accountLabel = (formData.get('account_label') as string) || undefined
    let perFileMeta: Array<{ displayName?: string; accountLabel?: string }> | undefined
    const rawPerFile = formData.get('per_file_meta') as string | null
    if (rawPerFile) {
      try { perFileMeta = JSON.parse(rawPerFile) } catch { /* ignore invalid JSON */ }
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // Get user ID from Auth header and create a per-request supabase client with RLS
    const authHeader = req.headers.get('authorization')
    const jwt = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    if (!jwt) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user?.id) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
    }
    const userId = userData.user.id

    // Use existing private bucket created via migration
    const bucketName = 'documents'

    const uploaded: any[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileDisplay = perFileMeta?.[i]?.displayName || displayName
      const fileAccount = perFileMeta?.[i]?.accountLabel || accountLabel
      const arrayBuffer = await file.arrayBuffer()
      const filePath = `${userId}/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, Buffer.from(arrayBuffer), {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      // Insert metadata into documents table
      const { error: dbError } = await supabase.from('documents').insert({
        user_id: userId,
        filename: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        storage_path: filePath,
        password_protected: !!password,
        doc_type: docType,
        display_name: fileDisplay,
        account_label: fileAccount,
        processing_status: 'pending',
      })
      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 })
      }
      // Create a short-lived signed URL for convenience
      const { data: signed } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 60 * 60)
      uploaded.push({ path: filePath, url: signed?.signedUrl, docType, passwordProvided: !!password, display_name: fileDisplay, account_label: fileAccount })
    }

    return NextResponse.json({ ok: true, uploaded })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
  }
}
