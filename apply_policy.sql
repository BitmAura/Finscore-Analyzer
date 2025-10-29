-- POLICY: User specific file access
CREATE POLICY "User specific file access"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);