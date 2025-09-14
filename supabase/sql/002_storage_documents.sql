-- Create Storage bucket `documents` if it doesn't already exist
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage RLS policies for `documents` bucket
-- Each user can only read/write files under their own folder: `${auth.uid()}/*`

-- Drop existing policies if present to make this script idempotent
drop policy if exists "documents_select_own" on storage.objects;
drop policy if exists "documents_insert_own" on storage.objects;
drop policy if exists "documents_update_own" on storage.objects;
drop policy if exists "documents_delete_own" on storage.objects;

-- Enable per-user read
create policy "documents_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (name like (auth.uid()::text || '/%'))
  );

-- Enable per-user upload
create policy "documents_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (name like (auth.uid()::text || '/%'))
  );

-- Enable per-user update
create policy "documents_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'documents'
    and (name like (auth.uid()::text || '/%'))
  );

-- Enable per-user delete
create policy "documents_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents'
    and (name like (auth.uid()::text || '/%'))
  );
