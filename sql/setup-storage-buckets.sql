-- ============================================
-- SUPABASE STORAGE BUCKETS SETUP
-- ============================================
-- Run this in Supabase SQL Editor to create storage buckets
-- and apply security policies
-- ============================================

-- Step 1: Create Storage Buckets (if not exists via UI, use this)
-- Note: You should create these via UI at https://app.supabase.com/project/_/storage/buckets
-- But here's the SQL equivalent:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('bank-statements', 'bank-statements', false, 52428800, ARRAY['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('reports', 'reports', false, 52428800, ARRAY['application/pdf', 'application/json']),
  ('user-uploads', 'user-uploads', false, 52428800, ARRAY['application/pdf', 'text/csv', 'image/png', 'image/jpeg']),
  ('exports', 'exports', false, 52428800, ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Step 2: Storage Security Policies
-- ============================================

-- Policy 1: Users can view their own files in bank-statements
CREATE POLICY "Users can view own bank statements"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'bank-statements' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can upload their own files to bank-statements
CREATE POLICY "Users can upload own bank statements"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bank-statements' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can delete their own files from bank-statements
CREATE POLICY "Users can delete own bank statements"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bank-statements' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can update their own files in bank-statements
CREATE POLICY "Users can update own bank statements"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'bank-statements' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Reports Bucket Policies
-- ============================================

CREATE POLICY "Users can view own reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload own reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own reports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- User Uploads Bucket Policies
-- ============================================

CREATE POLICY "Users can view own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Exports Bucket Policies
-- ============================================

CREATE POLICY "Users can view own exports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can create exports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own exports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Verification
-- ============================================

-- Check buckets created
SELECT id, name, public, file_size_limit, created_at 
FROM storage.buckets 
ORDER BY created_at DESC;

-- Check policies created
SELECT policyname, tablename 
FROM pg_policies 
WHERE schemaname = 'storage' 
ORDER BY policyname;

-- ============================================
-- DONE! ✅
-- ============================================
-- Your storage buckets are now set up with proper security policies.
-- Files will be organized by user ID:
-- 
-- Structure: bucket-name/user-id/filename
-- Example: bank-statements/abc-123-def-456/statement.pdf
-- 
-- Next: Test file upload at http://localhost:3000/dashboard
-- ============================================
