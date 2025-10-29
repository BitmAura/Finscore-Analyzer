-- ============================================
-- FINSCORE ANALYZER - SETUP VERIFICATION
-- ============================================
-- Run this after MASTER_COMPLETE_SCHEMA.sql to verify everything is correct
-- ============================================

-- ============================================
-- 1. CHECK ALL TABLES EXIST
-- ============================================
SELECT
    table_name,
    CASE
        WHEN table_name IN (
            'analysis_jobs', 'documents', 'bank_accounts', 'bank_transactions',
            'analysis_results', 'user_dashboard_stats', 'user_activities',
            'user_subscriptions', 'payment_transactions', 'api_keys',
            'audit_logs', 'security_logs'
        ) THEN '✅ EXISTS'
        ELSE '❌ UNEXPECTED'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: 12 tables with ✅ EXISTS status

-- ============================================
-- 2. CHECK ROW LEVEL SECURITY (RLS) ENABLED
-- ============================================
SELECT
    tablename as table_name,
    rowsecurity as rls_enabled,
    CASE
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: All tables should show ✅ ENABLED

-- ============================================
-- 3. CHECK RLS POLICIES
-- ============================================
SELECT
    tablename as table_name,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Expected: Each table should have 2-4 policies

-- ============================================
-- 4. DETAILED POLICY CHECK
-- ============================================
SELECT
    tablename as table_name,
    policyname as policy_name,
    cmd as operation,
    permissive,
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Expected: See all INSERT, SELECT, UPDATE, DELETE policies

-- ============================================
-- 5. CHECK INDEXES
-- ============================================
SELECT
    schemaname,
    tablename as table_name,
    indexname as index_name,
    indexdef as definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected: 15+ indexes across tables

-- ============================================
-- 6. CHECK FOREIGN KEY CONSTRAINTS
-- ============================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Expected: Multiple foreign keys to auth.users and between tables

-- ============================================
-- 7. CHECK TRIGGERS
-- ============================================
SELECT
    event_object_table as table_name,
    trigger_name,
    event_manipulation as trigger_event,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Expected: Update timestamp triggers on key tables

-- ============================================
-- 8. CHECK FUNCTIONS
-- ============================================
SELECT
    routine_name as function_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Expected: update_timestamp, update_user_stats_on_job_create, etc.

-- ============================================
-- 9. CHECK STORAGE BUCKET
-- ============================================
SELECT
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    CASE
        WHEN name = 'documents' AND public = false THEN '✅ CONFIGURED'
        WHEN name = 'documents' AND public = true THEN '⚠️ PUBLIC (NOT RECOMMENDED)'
        ELSE '❌ UNEXPECTED'
    END as status
FROM storage.buckets
WHERE name = 'documents';

-- Expected: 1 bucket named 'documents' with public = false

-- ============================================
-- 10. CHECK STORAGE POLICIES
-- ============================================
SELECT
    policyname as policy_name,
    cmd as operation,
    CASE
        WHEN policyname LIKE '%upload%' OR policyname LIKE '%insert%' THEN '✅ UPLOAD'
        WHEN policyname LIKE '%select%' OR policyname LIKE '%view%' THEN '✅ VIEW'
        WHEN policyname LIKE '%update%' THEN '✅ UPDATE'
        WHEN policyname LIKE '%delete%' THEN '✅ DELETE'
        ELSE '❓ UNKNOWN'
    END as policy_type
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY cmd;

-- Expected: 4 policies (one for each operation)

-- ============================================
-- 11. CHECK COLUMN DEFAULTS
-- ============================================
SELECT
    table_name,
    column_name,
    column_default,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_default IS NOT NULL
ORDER BY table_name, ordinal_position;

-- Expected: UUIDs, timestamps, status defaults, etc.

-- ============================================
-- 12. CHECK TABLE SIZES (After using the app)
-- ============================================
SELECT
    schemaname,
    tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Expected: Small sizes initially, will grow with usage

-- ============================================
-- 13. SUMMARY CHECK
-- ============================================
SELECT
    'Tables Created' as metric,
    COUNT(*)::text as value,
    CASE WHEN COUNT(*) >= 12 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'

UNION ALL

SELECT
    'RLS Enabled Tables',
    COUNT(*)::text,
    CASE WHEN COUNT(*) >= 12 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true

UNION ALL

SELECT
    'Total Policies',
    COUNT(*)::text,
    CASE WHEN COUNT(*) >= 40 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT
    'Total Indexes',
    COUNT(*)::text,
    CASE WHEN COUNT(*) >= 15 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_indexes
WHERE schemaname = 'public'

UNION ALL

SELECT
    'Functions',
    COUNT(*)::text,
    CASE WHEN COUNT(*) >= 3 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace

UNION ALL

SELECT
    'Storage Buckets',
    COUNT(*)::text,
    CASE WHEN COUNT(*) >= 1 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM storage.buckets
WHERE name = 'documents';

-- ============================================
-- 14. TEST USER STATS FUNCTION
-- ============================================
-- Run this to test if functions work correctly
-- (Replace the UUID with a real user_id after signup)

-- SELECT public.get_user_analytics('00000000-0000-0000-0000-000000000000');

-- Expected: Returns analytics data (all zeros initially)

-- ============================================
-- 15. CHECK PERMISSIONS
-- ============================================
SELECT
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- Expected: authenticated should have SELECT, INSERT, UPDATE, DELETE

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================
-- If all checks pass, your database is properly configured!
-- Next step: Set up storage policies via Supabase Dashboard UI
-- ============================================

