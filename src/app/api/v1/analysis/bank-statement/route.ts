import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('files');
  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
  }

  // Simulate analysis logic and upload to Supabase Storage
  const analysisId = uuidv4();
  const uploadedFiles: string[] = [];

  for (const file of files) {
    if (file instanceof File) {
      const { data, error } = await supabase.storage
        .from('bank-statements')
        .upload(`${analysisId}/${file.name}`, file);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      uploadedFiles.push(file.name);
    }
  }

  // Simulate saving analysis record
  await supabase.from('analyses').insert({
    id: analysisId,
    files: uploadedFiles,
    status: 'processing',
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ analysisId });
}
