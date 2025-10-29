# Supabase Migrations (Remote)

This project uses Supabase CLI linked to the cloud project `gnhuwhfxotmfkvongowp`.

Because Docker isn't installed on this machine, we do NOT use `db pull` or `db diff`.
Instead, we manage migrations manually and push them directly to the remote database.

## Commands

- Create a new empty migration file:
  supabase migration new <name>

- Apply pending migrations to the linked cloud project:
  supabase db push --linked --yes

- List migration history (local vs remote):
  supabase migration list --linked

## Authoring migrations

Place SQL in each migration file. Prefer idempotent patterns (IF NOT EXISTS) to allow safe re-runs.

Examples already in repo (for reference):
- sql/FIX_ALL_MISSING_COLUMNS.sql
- sql/seed_auto_first_user.sql (seed data, not a migration)

## Notes

- Avoid `supabase db pull` and `supabase db diff` unless Docker Desktop is installed.
- Seeds configured in `supabase/config.toml` are for local dev; use direct SQL or migrations for cloud.
