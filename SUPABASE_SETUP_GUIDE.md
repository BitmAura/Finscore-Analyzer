# Supabase Database Setup Guide

## Quick Setup (2 options)

### Option 1: Automated Script (Recommended)
```bash
node setup-database-complete.js
```

This will guide you through the setup and show you exactly what to run.

### Option 2: Manual SQL Editor (Most Reliable)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/gnhuwhfxotmfkvongowp/editor

2. **Run migrations in this order:**

   **a) Add missing document columns:**
   ```sql
   -- Copy and paste from: sql/ADD_MISSING_DOCUMENTS_FILE_COLUMNS.sql
   ```

   **b) Add status column:**
   ```sql
   -- Copy and paste from: sql/ADD_MISSING_DOCUMENTS_STATUS.sql
   ```

   **c) (Optional) Make original_name nullable:**
   ```sql
   -- Copy and paste from: sql/MAKE_ORIGINAL_NAME_OPTIONAL.sql
   ```

3. **Seed the database:**
   ```sql
   -- Copy and paste from: sql/seed_auto_first_user.sql
   ```

4. **Verify setup:**
   ```sql
   SELECT COUNT(*) as document_count FROM public.documents;
   SELECT COUNT(*) as job_count FROM public.analysis_jobs;
   SELECT COUNT(*) as account_count FROM public.bank_accounts;
   ```

## What Each Migration Does

### ADD_MISSING_DOCUMENTS_FILE_COLUMNS.sql
- Adds `file_type` (TEXT)
- Adds `mime_type` (TEXT)
- Adds `file_size` (BIGINT)
- Adds `detected_bank` (TEXT)

All safe to run multiple times (idempotent).

### ADD_MISSING_DOCUMENTS_STATUS.sql
- Adds `status` (TEXT DEFAULT 'uploaded')

Safe to run multiple times.

### MAKE_ORIGINAL_NAME_OPTIONAL.sql (Optional)
- Removes NOT NULL constraint from `original_name`

Only run this if you want to allow NULL values for original_name.

### seed_auto_first_user.sql
- Creates 120 sample documents
- Creates 30 sample analysis jobs
- Creates 60 sample bank accounts

All linked to the first user in your auth.users table.

## Expected Results

After running all migrations and seed:

```
documents:      120 rows
analysis_jobs:  30 rows
bank_accounts:  60 rows
```

## Troubleshooting

### If you see "column already exists" errors
✅ This is fine! The migrations are idempotent (safe to re-run).

### If you see "relation does not exist"
❌ Run your main schema first:
- `STEP_1_COMPLETE_SCHEMA.sql` or
- `sql/COMPLETE_PRODUCTION_SCHEMA.sql`

### If original_name NOT NULL errors persist
Run the optional migration: `sql/MAKE_ORIGINAL_NAME_OPTIONAL.sql`

## VS Code Supabase Extension Setup

1. Press `Ctrl+Shift+P`
2. Type: `Supabase: Login`
3. Authenticate in browser
4. Press `Ctrl+Shift+P` again
5. Type: `Supabase: Link Project`
6. Select: `gnhuwhfxotmfkvongowp`

After linking, you can browse tables and run queries directly in VS Code!

## Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/gnhuwhfxotmfkvongowp/editor
- **Table Editor**: https://supabase.com/dashboard/project/gnhuwhfxotmfkvongowp/editor
- **Authentication**: https://supabase.com/dashboard/project/gnhuwhfxotmfkvongowp/auth/users
- **Project Settings**: https://supabase.com/dashboard/project/gnhuwhfxotmfkvongowp/settings/general

## Need Help?

Just let me know which step you're on and I'll guide you through it!
