-- ============================================
-- FINAL DATABASE VERIFICATION SCRIPT
-- ============================================
-- Run this to see exactly what you have vs what you need
-- ============================================

-- Summary Report
DO $$
DECLARE
    table_count INTEGER;
    missing_created_at INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO missing_created_at
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.column_name = 'created_at'
        AND c.table_schema = 'public'
    );

    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname NOT LIKE '%_pkey';

    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 DATABASE INVENTORY REPORT';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Tables: %', table_count;
    RAISE NOTICE 'Tables Missing created_at: %', missing_created_at;
    RAISE NOTICE 'RLS Policies: %', policy_count;
    RAISE NOTICE 'Indexes (non-PK): %', index_count;
    RAISE NOTICE '========================================';
END $$;

-- List all tables with their column counts
SELECT
    t.table_name,
    COUNT(c.column_name) as column_count,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = t.table_name
                    AND column_name = 'created_at') THEN '✅'
        ELSE '❌'
    END as has_created_at,
    CASE
        WHEN pt.rowsecurity = true THEN '✅'
        ELSE '❌'
    END as rls_enabled
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
    ON t.table_name = c.table_name AND t.table_schema = c.table_schema
LEFT JOIN pg_tables pt
    ON t.table_name = pt.tablename AND pt.schemaname = 'public'
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name, pt.rowsecurity
ORDER BY t.table_name;

-- Check which core tables are missing
SELECT
    expected_table,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = expected_table) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (VALUES
    ('analysis_jobs'),
    ('documents'),
    ('bank_accounts'),
    ('bank_transactions'),
    ('analysis_results'),
    ('user_dashboard_stats'),
    ('user_activities'),
    ('user_subscriptions'),
    ('payment_transactions'),
    ('api_keys'),
    ('audit_logs'),
    ('security_logs')
) AS expected(expected_table)
ORDER BY expected_table;

-- Check key columns in analysis_jobs
SELECT
    expected_column,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = 'analysis_jobs'
                    AND column_name = expected_column) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (VALUES
    ('id'),
    ('user_id'),
    ('report_name'),
    ('reference_id'),
    ('report_type'),
    ('status'),
    ('ai_executive_summary'),
    ('trends'),
    ('anomalies'),
    ('created_at'),
    ('updated_at')
) AS expected(expected_column)
ORDER BY expected_column;

