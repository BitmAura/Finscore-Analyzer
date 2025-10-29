-- Adds missing columns to public.documents to align with seeding and app expectations
-- Safe to run multiple times; only creates columns if not present.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='documents' AND column_name='file_type'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN file_type TEXT;
    RAISE NOTICE 'Added documents.file_type (TEXT)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='documents' AND column_name='mime_type'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN mime_type TEXT;
    RAISE NOTICE 'Added documents.mime_type (TEXT)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='documents' AND column_name='file_size'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN file_size BIGINT;
    RAISE NOTICE 'Added documents.file_size (BIGINT)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='documents' AND column_name='detected_bank'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN detected_bank TEXT;
    RAISE NOTICE 'Added documents.detected_bank (TEXT)';
  END IF;
END $$;
