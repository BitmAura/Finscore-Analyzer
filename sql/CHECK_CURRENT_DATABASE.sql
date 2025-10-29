-- ============================================
-- DATABASE INVENTORY CHECK
-- ============================================
-- Run this first to see what you currently have
-- ============================================

-- 1. List all tables
SELECT
    'TABLE' as type,
    table_name as name,
    '✅' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check columns for each table
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Check if RLS is enabled
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Count policies per table
SELECT
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 5. List all indexes
SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- 6. Check for missing created_at columns
SELECT
    t.table_name,
    CASE
        WHEN c.column_name IS NULL THEN '❌ MISSING created_at'
        ELSE '✅ HAS created_at'
    END as status
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND c.column_name = 'created_at'
    AND c.table_schema = 'public'
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

