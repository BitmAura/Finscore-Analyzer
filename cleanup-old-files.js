#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('\n🧹 FinScore Analyzer - File Cleanup Script\n');
console.log('This will remove 49 obsolete SQL and documentation files.\n');

// Files to delete
const filesToDelete = {
  // Root SQL files
  root: [
    'supabase_schema.sql',
    'supabase_schema_bank_accounts.sql',
    'supabase_storage.sql',
    'apply_policy.sql'
  ],
  
  // SQL directory - old schemas
  sql: [
    'BULLETPROOF_SCHEMA.sql',
    'BANKING_FEATURES_SCHEMA.sql',
    'CLEAN_PRODUCTION_SCHEMA.sql',
    'COMPLETE_FIXED_SCHEMA.sql',
    'COMPLETE_PRODUCTION_SCHEMA.sql',
    'complete_schema.sql',
    'enhanced_schema.sql',
    'FINAL_PRODUCTION_SCHEMA.sql',
    'FIXED_PRODUCTION_SCHEMA.sql',
    'MASTER_COMPLETE_SCHEMA.sql',
    'MULTI_STATEMENT_CONSOLIDATION.sql',
    'PRODUCTION_READY_SCHEMA.sql',
    'SUPABASE_PRODUCTION_SCHEMA.sql',
    'safe_setup.sql',
    'supabase_schema.sql',
    'supabase_schema_bank_accounts.sql',
    'supabase_storage.sql',
    // Temporary fix files
    'ADD_MISSING_DOCUMENTS_FILE_COLUMNS.sql',
    'ADD_MISSING_DOCUMENTS_STATUS.sql',
    'ADD_ONLY_MISSING.sql',
    'FIX_ADD_METADATA_COLUMN.sql',
    'FIX_USER_DASHBOARD_STATS_COLUMNS.sql',
    'MAKE_ORIGINAL_NAME_OPTIONAL.sql',
    'UPGRADE_BASIC_TO_PRODUCTION_SCHEMA.sql',
    // Check scripts
    'CHECK_CURRENT_DATABASE.sql',
    'CHECK_EXISTING_DATABASE.sql',
    'FINAL_VERIFICATION.sql',
    'QUICK_CHECK.sql',
    'verify_setup.sql',
    // Old seed scripts
    'seed_basic_schema.sql',
    'seed_sample_data.sql',
    // Old feature scripts
    'add_ai_executive_summary.sql',
    'add_trends_and_anomalies.sql',
    // Old storage/dashboard
    'custom_storage_policy.sql',
    'setup-storage-buckets.sql',
    'supabase_dashboard_tables.sql',
    // Old migrations
    'V1__create_account_model.sql',
    'V2__add_unique_constraint_to_transactions.sql'
  ],
  
  // Documentation files
  docs: [
    'FIXES_COMPLETED.md',
    'TESTING_CHECKLIST.md',
    'SUPPORTED_BANKS_WORLDWIDE.md',
    'NBFC_PRIVATE_BANK_FEATURES.md',
    'INTEGRATION_CHECKLIST.md',
    'HOW_TO_FIND_SERVICE_ROLE_KEY.md',
    'IDE_SETUP.md',
    'VS_CODE_SETUP_COMPLETE.md'
  ]
};

let deletedCount = 0;
let errorCount = 0;
let skippedCount = 0;

// Delete root SQL files
console.log('📁 Cleaning root directory...');
filesToDelete.root.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  ✅ Deleted: ${file}`);
      deletedCount++;
    } else {
      console.log(`  ⏭️  Skipped (not found): ${file}`);
      skippedCount++;
    }
  } catch (err) {
    console.log(`  ❌ Error deleting ${file}: ${err.message}`);
    errorCount++;
  }
});

// Delete SQL directory files
console.log('\n📁 Cleaning sql/ directory...');
filesToDelete.sql.forEach(file => {
  const filePath = path.join(__dirname, 'sql', file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  ✅ Deleted: sql/${file}`);
      deletedCount++;
    } else {
      console.log(`  ⏭️  Skipped (not found): sql/${file}`);
      skippedCount++;
    }
  } catch (err) {
    console.log(`  ❌ Error deleting sql/${file}: ${err.message}`);
    errorCount++;
  }
});

// Delete documentation files
console.log('\n📁 Cleaning documentation files...');
filesToDelete.docs.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  ✅ Deleted: ${file}`);
      deletedCount++;
    } else {
      console.log(`  ⏭️  Skipped (not found): ${file}`);
      skippedCount++;
    }
  } catch (err) {
    console.log(`  ❌ Error deleting ${file}: ${err.message}`);
    errorCount++;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Cleanup Summary:');
console.log(`  ✅ Deleted: ${deletedCount} files`);
console.log(`  ⏭️  Skipped: ${skippedCount} files (not found)`);
console.log(`  ❌ Errors: ${errorCount} files`);
console.log('='.repeat(50));

console.log('\n✨ Essential files kept:');
console.log('  📄 STEP_1_COMPLETE_SCHEMA.sql (main schema)');
console.log('  📄 STEP_2_SECURITY_POLICIES.sql (security)');
console.log('  📄 sql/seed_auto_first_user.sql (seed data)');
console.log('  📄 sql/FIX_ALL_MISSING_COLUMNS.sql (fixes)');
console.log('  📄 sql/security_policies.sql');
console.log('  📄 sql/storage_policies.sql');
console.log('  📄 sql/STORAGE_SETUP.sql');
console.log('  📄 sql/stored_procedures.sql');
console.log('  📄 README.md + 5 other important docs');

console.log('\n✅ Cleanup complete! Your project is now much cleaner.\n');
