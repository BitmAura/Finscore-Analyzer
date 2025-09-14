-- Add optional friendly display name and account label to documents
alter table if exists public.documents
  add column if not exists display_name text null,
  add column if not exists account_label text null;

-- Indexes for potential filtering
create index if not exists idx_documents_display_name on public.documents((lower(display_name)));
create index if not exists idx_documents_account_label on public.documents((lower(account_label)));
