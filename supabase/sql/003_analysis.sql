-- Analysis results for documents
create table if not exists public.document_analysis (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null,
  summary jsonb,
  metrics jsonb,
  risk_score numeric,
  compliance_score numeric,
  created_at timestamptz default now()
);

alter table public.document_analysis enable row level security;

-- Policies: owner can read/write their analyses
drop policy if exists "analysis_select_own" on public.document_analysis;
create policy "analysis_select_own" on public.document_analysis
  for select using (auth.uid() = user_id);
drop policy if exists "analysis_insert_own" on public.document_analysis;
create policy "analysis_insert_own" on public.document_analysis
  for insert with check (auth.uid() = user_id);