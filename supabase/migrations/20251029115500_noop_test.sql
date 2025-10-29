-- No-op migration to verify remote push works
DO $$ BEGIN
  RAISE NOTICE 'noop migration applied at %', now();
END $$;