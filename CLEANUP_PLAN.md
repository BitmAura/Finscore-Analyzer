# SQL & Documentation Cleanup Plan

## 📋 Files to KEEP (Essential)

### Root SQL Files (KEEP - Main Schema)
- ✅ `STEP_1_COMPLETE_SCHEMA.sql` - Main production schema
- ✅ `STEP_2_SECURITY_POLICIES.sql` - Security policies
- ✅ `setup-supabase-schema.js` - Automated setup script

### SQL Directory - KEEP (Active/Working)
- ✅ `seed_auto_first_user.sql` - Working seed script (JUST USED)
- ✅ `FIX_ALL_MISSING_COLUMNS.sql` - Column fixes (JUST USED)
- ✅ `security_policies.sql` - Security policies
- ✅ `storage_policies.sql` - Storage bucket policies
- ✅ `STORAGE_SETUP.sql` - Storage configuration
- ✅ `stored_procedures.sql` - Functions and triggers

### Documentation - KEEP (Important)
- ✅ `README.md` - Main project documentation
- ✅ `.github/copilot-instructions.md` - AI coding instructions
- ✅ `SUPABASE_SETUP_GUIDE.md` - Setup guide (you just used this!)
- ✅ `INDIA_BANKS_COMPLETE.md` - India banking features
- ✅ `ANALYSIS_FEATURES_45+.md` - Feature documentation
- ✅ `ROADMAP_2025_ADVANCED.md` - Project roadmap

---

## 🗑️ Files to DELETE (Duplicates/Obsolete)

### Root SQL Files - DELETE (Duplicates)
- ❌ `supabase_schema.sql` - Duplicate of STEP_1
- ❌ `supabase_schema_bank_accounts.sql` - Already in STEP_1
- ❌ `supabase_storage.sql` - Already in STEP_2
- ❌ `apply_policy.sql` - Already in STEP_2

### SQL Directory - DELETE (Old/Duplicate Schemas)
- ❌ `BULLETPROOF_SCHEMA.sql` - Old version
- ❌ `BANKING_FEATURES_SCHEMA.sql` - Old version
- ❌ `CLEAN_PRODUCTION_SCHEMA.sql` - Old version
- ❌ `COMPLETE_FIXED_SCHEMA.sql` - Old version
- ❌ `COMPLETE_PRODUCTION_SCHEMA.sql` - Old version
- ❌ `complete_schema.sql` - Old version
- ❌ `enhanced_schema.sql` - Old version
- ❌ `FINAL_PRODUCTION_SCHEMA.sql` - Old version
- ❌ `FIXED_PRODUCTION_SCHEMA.sql` - Old version
- ❌ `MASTER_COMPLETE_SCHEMA.sql` - Old version
- ❌ `MULTI_STATEMENT_CONSOLIDATION.sql` - Old version
- ❌ `PRODUCTION_READY_SCHEMA.sql` - Old version
- ❌ `SUPABASE_PRODUCTION_SCHEMA.sql` - Old version
- ❌ `safe_setup.sql` - Old version
- ❌ `supabase_schema.sql` - Duplicate
- ❌ `supabase_schema_bank_accounts.sql` - Duplicate
- ❌ `supabase_storage.sql` - Duplicate

### SQL Directory - DELETE (Temporary Fix Files - Already Applied)
- ❌ `ADD_MISSING_DOCUMENTS_FILE_COLUMNS.sql` - Already applied
- ❌ `ADD_MISSING_DOCUMENTS_STATUS.sql` - Already applied
- ❌ `ADD_ONLY_MISSING.sql` - Already applied
- ❌ `FIX_ADD_METADATA_COLUMN.sql` - Superseded by FIX_ALL_MISSING_COLUMNS
- ❌ `FIX_USER_DASHBOARD_STATS_COLUMNS.sql` - Superseded by FIX_ALL_MISSING_COLUMNS
- ❌ `MAKE_ORIGINAL_NAME_OPTIONAL.sql` - Already applied
- ❌ `UPGRADE_BASIC_TO_PRODUCTION_SCHEMA.sql` - Already upgraded

### SQL Directory - DELETE (Check/Verification Scripts - Not Needed)
- ❌ `CHECK_CURRENT_DATABASE.sql` - One-time check
- ❌ `CHECK_EXISTING_DATABASE.sql` - One-time check
- ❌ `FINAL_VERIFICATION.sql` - One-time check
- ❌ `QUICK_CHECK.sql` - One-time check
- ❌ `verify_setup.sql` - One-time check

### SQL Directory - DELETE (Old Seed Scripts)
- ❌ `seed_basic_schema.sql` - Using seed_auto_first_user.sql instead
- ❌ `seed_sample_data.sql` - Using seed_auto_first_user.sql instead

### SQL Directory - DELETE (Old Feature Scripts)
- ❌ `add_ai_executive_summary.sql` - Already in main schema
- ❌ `add_trends_and_anomalies.sql` - Already in main schema

### SQL Directory - DELETE (Old Storage/Dashboard)
- ❌ `custom_storage_policy.sql` - Using storage_policies.sql
- ❌ `setup-storage-buckets.sql` - Using STORAGE_SETUP.sql
- ❌ `supabase_dashboard_tables.sql` - Already in main schema

### SQL Directory - DELETE (Old Migrations)
- ❌ `V1__create_account_model.sql` - Old migration system
- ❌ `V2__add_unique_constraint_to_transactions.sql` - Old migration system

### Documentation - DELETE (Obsolete/Temporary)
- ❌ `FIXES_COMPLETED.md` - Temporary fix tracking
- ❌ `TESTING_CHECKLIST.md` - Outdated checklist
- ❌ `SUPPORTED_BANKS_WORLDWIDE.md` - Not India-focused (redundant)
- ❌ `NBFC_PRIVATE_BANK_FEATURES.md` - Already in INDIA_BANKS_COMPLETE.md
- ❌ `INTEGRATION_CHECKLIST.md` - Temporary setup doc
- ❌ `HOW_TO_FIND_SERVICE_ROLE_KEY.md` - One-time setup
- ❌ `IDE_SETUP.md` - One-time setup
- ❌ `VS_CODE_SETUP_COMPLETE.md` - One-time setup

---

## 📊 Cleanup Summary

**Root SQL Files:**
- KEEP: 2 files (STEP_1, STEP_2)
- DELETE: 4 files

**SQL Directory:**
- KEEP: 6 files
- DELETE: 37 files

**Documentation:**
- KEEP: 6 files
- DELETE: 8 files

**Total:**
- KEEP: 14 files
- DELETE: 49 files

---

## ✅ What to Run Next

Review this plan, then run:
```powershell
node cleanup-old-files.js
```

This will safely delete all the obsolete files.
