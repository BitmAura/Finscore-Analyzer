-- Supabase Storage Schema for FinScore Analyzer
-- Add any storage-related setup here (buckets, policies, etc.)

-- Example: Create a bucket for bank statements
-- This is usually done in Supabase dashboard, but you can document it here
-- Bucket name: bank-statements

-- Example: Enable Row Level Security (RLS) on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to access their own files
CREATE POLICY "Users can access their own files"
  ON storage.objects
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT WITH CHECK (auth.uid() = owner);

-- Moved all SQL schema files from root to /sql folder for better organization
