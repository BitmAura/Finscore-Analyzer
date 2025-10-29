-- COMPLETE FIX - Add ALL missing columns to make seed work
-- This is the definitive fix for all column errors
-- Safe to run multiple times (idempotent)

DO $$
BEGIN
  RAISE NOTICE 'Starting comprehensive column fixes...';

  -- ═══════════════════════════════════════════════════════════
  -- Fix analysis_jobs table
  -- ═══════════════════════════════════════════════════════════
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='metadata'
  ) THEN
    ALTER TABLE public.analysis_jobs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✓ Added analysis_jobs.metadata';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='result'
  ) THEN
    ALTER TABLE public.analysis_jobs ADD COLUMN result JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✓ Added analysis_jobs.result';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.analysis_jobs ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✓ Added analysis_jobs.updated_at';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='completed_at'
  ) THEN
    ALTER TABLE public.analysis_jobs ADD COLUMN completed_at TIMESTAMPTZ;
    RAISE NOTICE '✓ Added analysis_jobs.completed_at';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='error'
  ) THEN
    ALTER TABLE public.analysis_jobs ADD COLUMN error TEXT;
    RAISE NOTICE '✓ Added analysis_jobs.error';
  END IF;

  -- ═══════════════════════════════════════════════════════════
  -- Fix user_dashboard_stats table
  -- ═══════════════════════════════════════════════════════════
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_dashboard_stats' AND column_name='last_analysis_at'
  ) THEN
    ALTER TABLE public.user_dashboard_stats ADD COLUMN last_analysis_at TIMESTAMPTZ;
    RAISE NOTICE '✓ Added user_dashboard_stats.last_analysis_at';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_dashboard_stats' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.user_dashboard_stats ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✓ Added user_dashboard_stats.updated_at';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_dashboard_stats' AND column_name='created_at'
  ) THEN
    ALTER TABLE public.user_dashboard_stats ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✓ Added user_dashboard_stats.created_at';
  END IF;

  -- ═══════════════════════════════════════════════════════════
  -- Fix documents table
  -- ═══════════════════════════════════════════════════════════
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='documents' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✓ Added documents.updated_at';
  END IF;

  RAISE NOTICE 'All column fixes completed successfully!';
END $$;

-- Verify all tables have required columns
SELECT 
  'analysis_jobs' as table_name,
  COUNT(*) FILTER (WHERE column_name = 'metadata') as has_metadata,
  COUNT(*) FILTER (WHERE column_name = 'updated_at') as has_updated_at
FROM information_schema.columns
WHERE table_schema='public' AND table_name='analysis_jobs'
UNION ALL
SELECT 
  'user_dashboard_stats' as table_name,
  COUNT(*) FILTER (WHERE column_name = 'last_analysis_at') as has_last_analysis,
  COUNT(*) FILTER (WHERE column_name = 'updated_at') as has_updated_at
FROM information_schema.columns
WHERE table_schema='public' AND table_name='user_dashboard_stats';
