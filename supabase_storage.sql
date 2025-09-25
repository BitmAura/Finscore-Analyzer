-- FinScore Analyzer - Supabase Storage Setup
-- This script sets up the storage bucket for user documents and the necessary RLS policies.

-- 1. Create the storage bucket
-- This bucket will store the uploaded bank statements.
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', FALSE);

-- 2. Create RLS policies for the 'documents' bucket
-- These policies ensure that users can only access their own files.

-- Policy: Allow users to view their own files
CREATE POLICY "Allow users to view their own files" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Allow users to upload files to their own folder
-- The folder structure is {user_id}/{job_id}/{file_name}
CREATE POLICY "Allow users to upload to their own folder" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
