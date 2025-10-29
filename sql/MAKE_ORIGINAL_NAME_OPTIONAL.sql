-- Make public.documents.original_name nullable if you prefer a looser schema
-- Safe to run multiple times; only drops NOT NULL if currently enforced.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documents'
      AND column_name = 'original_name'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.documents ALTER COLUMN original_name DROP NOT NULL;
    RAISE NOTICE 'Dropped NOT NULL on documents.original_name';
  END IF;
END $$;
