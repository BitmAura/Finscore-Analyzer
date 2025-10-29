-- ============================================
-- CHECK WHAT EXISTS IN YOUR DATABASE
-- ============================================
-- Run this FIRST to see what you already have
-- ============================================

-- 1. LIST ALL EXISTING TABLES
SELECT
    table_name,
    '✅ EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. LIST ALL EXISTING INDEXES
SELECT
    schemaname,
    tablename,
    indexname,
    '✅ EXISTS' as status
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 3. LIST ALL EXISTING POLICIES
SELECT
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. CHECK SPECIFIC TABLES FOR COLUMNS
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'analysis_jobs',
    'bank_transactions',
    'bank_accounts',
    'documents',
    'user_dashboard_stats',
    'user_activities',
    'analysis_results',
    'user_subscriptions',
    'payment_transactions',
    'transactions'
)
ORDER BY table_name, ordinal_position;

-- 5. CHECK IF CREATED_AT EXISTS IN ALL TABLES
SELECT
    table_name,
    CASE
        WHEN column_name = 'created_at' THEN '✅ HAS created_at'
        ELSE '❌ MISSING created_at'
    END as status
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND c.column_name = 'created_at'
    AND c.table_schema = 'public'
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
ORDER BY table_name;

-- 6. CHECK FOR DUPLICATE INDEXES
SELECT
    indexname,
    COUNT(*) as duplicate_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY indexname
HAVING COUNT(*) > 1;

