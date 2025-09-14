-- Reports schema for aggregated analyses
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  reference_id text,
  report_type text not null check (report_type in ('bank', 'gst')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_type on public.reports(report_type);

alter table public.reports enable row level security;

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports for select using (auth.uid() = user_id);
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports for insert with check (auth.uid() = user_id);
drop policy if exists "reports_update_own" on public.reports;
create policy "reports_update_own" on public.reports for update using (auth.uid() = user_id);
drop policy if exists "reports_delete_own" on public.reports;
create policy "reports_delete_own" on public.reports for delete using (auth.uid() = user_id);

-- Join table for attaching documents to a report
create table if not exists public.report_documents (
  report_id uuid references public.reports(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  account_label text,
  created_at timestamptz default now(),
  primary key (report_id, document_id)
);

create index if not exists idx_report_documents_report on public.report_documents(report_id);
create index if not exists idx_report_documents_document on public.report_documents(document_id);

alter table public.report_documents enable row level security;

-- RLS: user must own the report and the document
drop policy if exists "report_documents_select_own" on public.report_documents;
create policy "report_documents_select_own" on public.report_documents for select using (
  exists (
    select 1 from public.reports r where r.id = report_id and r.user_id = auth.uid()
  )
);

drop policy if exists "report_documents_insert_own" on public.report_documents;
create policy "report_documents_insert_own" on public.report_documents for insert with check (
  exists (
    select 1 from public.reports r where r.id = report_id and r.user_id = auth.uid()
  ) and exists (
    select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid()
  )
);

drop policy if exists "report_documents_delete_own" on public.report_documents;
create policy "report_documents_delete_own" on public.report_documents for delete using (
  exists (
    select 1 from public.reports r where r.id = report_id and r.user_id = auth.uid()
  )
);
