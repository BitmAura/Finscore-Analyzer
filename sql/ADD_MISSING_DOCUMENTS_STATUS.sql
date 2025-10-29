-- Adds missing status column to public.documents to align with seeding and app expectations
-- Safe to run multiple times; only creates the column if not present.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='documents' AND column_name='status'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN status TEXT DEFAULT 'uploaded';
    RAISE NOTICE 'Added documents.status (TEXT DEFAULT ''uploaded'')';
  END IF;
END $$;