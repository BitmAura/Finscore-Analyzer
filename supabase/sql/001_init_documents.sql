-- Documents table for uploads metadata
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  filename text not null,
  file_type text not null,
  file_size bigint not null,
  storage_path text not null,
  password_protected boolean default false,
  doc_type text default 'unknown',
  processing_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_status on public.documents(processing_status);

-- RLS
alter table public.documents enable row level security;

-- Policies: owner can read/write own documents
drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);
drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id);

-- Allow owner to delete their own documents
drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

-- Storage bucket policy (requires bucket named 'documents')
-- Example policy snippets (set in Storage policies in Supabase dashboard):
-- Allow authenticated users to upload to their own folder
-- path like `${auth.uid()}/*`
