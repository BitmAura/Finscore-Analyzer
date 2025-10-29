# Supabase CLI – Remote Workflow (Windows)

This repo is linked to the Supabase Cloud project:
- Project Ref: `gnhuwhfxotmfkvongowp`

We avoid Docker-only features and use remote migrations directly.

## 1) Verify CLI & Link

```powershell
supabase --version
supabase link --project-ref gnhuwhfxotmfkvongowp
```

If prompted to login:
```powershell
supabase login
```

## 2) Create a new migration

```powershell
supabase migration new add_example_table
```
This creates: `supabase/migrations/YYYYMMDDHHMMSS_add_example_table.sql`.
Add SQL into that file. Prefer idempotent `IF NOT EXISTS` where possible.

## 3) Push migrations to the cloud (remote)

```powershell
supabase db push --linked --yes
```

## 4) List migration status

```powershell
supabase migration list --linked
```

## 5) Execute one-off SQL (option A: migration)
- Put the SQL in a migration file and push as above. This is the safest workflow.

## Notes
- `supabase db pull` and `supabase db diff` require Docker; skip them for now.
- Seeds in `supabase/config.toml` are for local only. For cloud seeding, we keep using `sql/seed_auto_first_user.sql` directly in the dashboard or as a migration if you want it versioned.
- The project is already linked; you don’t need to link again unless you change folders.
