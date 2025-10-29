-- ============================================
-- QUICK DATABASE CHECK
-- ============================================
-- Run this FIRST to see what's in your database
-- ============================================

SELECT
    'TABLE CHECK' as check_type,
    table_name,
    '✅ EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if documents table has created_at
SELECT
    'DOCUMENTS COLUMNS' as check_type,
    column_name,
    data_type,
    CASE
        WHEN column_name IN ('created_at', 'updated_at') THEN '🕐 TIMESTAMP'
        ELSE '📝 FIELD'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'documents'
ORDER BY ordinal_position;

