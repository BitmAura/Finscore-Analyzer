-- Auto-seed using the first non-system auth user (Supabase)
-- This script will insert sample documents, analysis jobs and bank accounts for the first user found in auth.users.
-- Run in Supabase SQL editor.

WITH first_user AS (
  SELECT id FROM auth.users WHERE id IS NOT NULL LIMIT 1
)
-- Note: many deployments require original_name NOT NULL. We insert it equal to name for seeds.
INSERT INTO public.documents (id, user_id, name, original_name, file_path, file_type, file_size, detected_bank, status)
SELECT
  gen_random_uuid(),
  fu.id,
  format('sample-statement-%s.pdf', i),
  format('sample-statement-%s.pdf', i),
  format('documents/%s/sample-statement-%s.pdf', fu.id::text, i),
  'application/pdf',
  (1024 * 1024 * 2)::bigint,
  (ARRAY['HDFC Bank','State Bank of India','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Yes Bank'])[ (i % 6) + 1 ],
  'uploaded'
FROM generate_series(1,120) AS s(i), first_user fu;

-- Insert 30 sample analysis jobs for that user
WITH first_user AS (
  SELECT id FROM auth.users WHERE id IS NOT NULL LIMIT 1
)
INSERT INTO public.analysis_jobs (id, user_id, report_name, reference_id, report_type, status, document_name, metadata, created_at)
SELECT
  gen_random_uuid(),
  fu.id,
  format('Auto Report %s', i),
  format('REF-%s', floor(random()*1000000)::int),
  (ARRAY['comprehensive','basic'])[ (i % 2) + 1 ],
  (ARRAY['pending','processing','completed'])[ ((i % 3) + 1) ],
  format('%s document(s)', (i % 6) + 1),
  jsonb_build_object(
    'fileCount', (i % 6) + 1,
    'detectedBanks', (ARRAY['HDFC Bank','State Bank of India','ICICI Bank','Axis Bank'])[1:((i % 3)+1)]
  ),
  now() - (i || ' hours')::interval
FROM generate_series(1,30) AS s(i), first_user fu;

-- Insert 60 sample bank_accounts for that user
WITH first_user AS (
  SELECT id FROM auth.users WHERE id IS NOT NULL LIMIT 1
)
INSERT INTO public.bank_accounts (id, user_id, job_id, bank_name, account_number, account_holder, account_type, created_at)
SELECT
  gen_random_uuid(),
  fu.id,
  NULL,
  (ARRAY['HDFC Bank','State Bank of India','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Yes Bank'])[ (i % 6) + 1 ],
  concat('IN', floor(random()*1e10)::bigint + 1000000000),
  format('Sample Holder %s', i),
  (ARRAY['savings','current'])[ (i % 2) + 1 ],
  now() - (i || ' days')::interval
FROM generate_series(1,60) AS s(i), first_user fu;

-- Optional: attach some bank accounts to jobs
WITH job_ids AS (
  SELECT id FROM public.analysis_jobs ORDER BY created_at LIMIT 20
), acc AS (
  SELECT id FROM public.bank_accounts ORDER BY created_at LIMIT 40
)
UPDATE public.bank_accounts b
SET job_id = (SELECT id FROM job_ids ORDER BY random() LIMIT 1)
WHERE b.id IN (SELECT id FROM acc);

-- Done.

