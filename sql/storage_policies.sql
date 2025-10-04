-- FinScore Analyzer - Storage Bucket Policies
--
-- ⚠️ IMPORTANT: You CANNOT execute this SQL directly!
-- The storage.objects table is system-owned by Supabase.
--
-- Instead, follow these steps in Supabase Dashboard UI:

-- ============================================
-- HOW TO ADD STORAGE POLICIES (Via Dashboard)
-- ============================================

-- 1. Go to Supabase Dashboard → Storage → documents bucket
-- 2. Click "Policies" tab
-- 3. Click "New Policy" for each policy below

-- ============================================
-- POLICY 1: Allow Upload (INSERT)
-- ============================================
-- Policy Name: Users can upload own documents
-- Allowed Operation: INSERT
-- Target Roles: authenticated
-- WITH CHECK expression:
--
-- bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text

-- ============================================
-- POLICY 2: Allow View (SELECT)
-- ============================================
-- Policy Name: Users can view own documents
-- Allowed Operation: SELECT
-- Target Roles: authenticated
-- USING expression:
--
-- bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text

-- ============================================
-- POLICY 3: Allow Update (UPDATE)
-- ============================================
-- Policy Name: Users can update own documents
-- Allowed Operation: UPDATE
-- Target Roles: authenticated
-- USING expression:
--
-- bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text

-- ============================================
-- POLICY 4: Allow Delete (DELETE)
-- ============================================
-- Policy Name: Users can delete own documents
-- Allowed Operation: DELETE
-- Target Roles: authenticated
-- USING expression:
--
-- bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text

-- ============================================
-- SIMPLER ALTERNATIVE (For Testing)
-- ============================================
-- If you want to test quickly:
-- 1. Go to Storage → documents bucket
-- 2. Click "Edit bucket"
-- 3. Toggle "Public bucket" to ON
-- 4. Click "Save"
--
-- ⚠️ WARNING: Makes all files public! Only for testing.

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- After adding policies via UI, verify with this query:

SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY policyname;

-- You should see 4 policies listed

