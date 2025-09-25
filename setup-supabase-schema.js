#!/usr/bin/env node
// Supabase Schema Setup Script
// This script will push your schema to Supabase using the Supabase CLI

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.development' });

console.log('Setting up Supabase schema for FinScore Analyzer...');

// Check if the Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Supabase CLI not found. Please install it using:');
  console.error('npm install -g supabase');
  process.exit(1);
}

// Check if we have the required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables. Please check your .env.development file.');
  process.exit(1);
}

console.log('✅ Supabase environment variables found.');
console.log(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

console.log('\nYou can run this schema in the Supabase SQL Editor:');
console.log('1. Go to https://app.supabase.com/project/_/sql');
console.log('2. Open the SQL Editor');
console.log('3. Copy and paste the contents of supabase_schema.sql');
console.log('4. Run the SQL script\n');

// Provide instructions on how to use Supabase with Next.js
console.log('To use Supabase in your Next.js components and API routes:');
console.log('```javascript');
console.log('import supabase from "@/lib/supabase";');
console.log('');
console.log('// Example: Fetch data from Supabase');
console.log('async function fetchProfiles() {');
console.log('  const { data, error } = await supabase');
console.log('    .from("profiles")');
console.log('    .select("*");');
console.log('');
console.log('  if (error) {');
console.log('    console.error("Error fetching profiles:", error);');
console.log('    return [];');
console.log('  }');
console.log('');
console.log('  return data;');
console.log('}');
console.log('```');

console.log('\nThis schema needs to be executed in the Supabase SQL Editor to set up:');
console.log('- User profiles table with RLS policies');
console.log('- Analysis jobs table with RLS policies');
console.log('- Transactions table with RLS policies');
console.log('- Automatic user profile creation trigger');

console.log('\nFor authentication, you can use the Supabase Auth UI:');
console.log('npm install @supabase/auth-ui-react @supabase/auth-ui-shared');
