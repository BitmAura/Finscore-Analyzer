import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { files } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Simulate processing files and creating an analysis job
    const analysisId = `analysis_${Date.now()}`;

    // Insert a new analysis job into the database
    const { error } = await supabase.from('analysis_jobs').insert({
      id: analysisId,
      status: 'processing',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Failed to create analysis job: ${error.message}`);
      return res.status(500).json({ error: 'Failed to create analysis job' });
    }

    res.status(200).json({ analysisId });
  } catch (error: any) {
    console.error('Error in analysis API:', error);
    res.status(500).json({ error: error.message });
  }
}
