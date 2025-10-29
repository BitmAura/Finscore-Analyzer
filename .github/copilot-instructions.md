<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
<!-- Workspace-specific Copilot instructions for FinScore Analyzer

Purpose: give AI coding agents immediate, actionable knowledge to be productive in this repo.
Keep this short, concrete and tied to files and commands that exist here.
-->

## Quick orientation
- Tech stack: Next.js (App Router — see `src/app`), TypeScript, Tailwind CSS. Custom server entry: `server.js` (dev runs via `node server.js`).
- Main concerns: PDF/CSV ingestion, Supabase-backed storage/auth, analysis pipelines, and report generation. SQL schema and seed scripts live under `/sql` and at the repo root (e.g., `setup-supabase-schema.js`, `supabase_schema.sql`, `STEP_1_COMPLETE_SCHEMA.sql`).

## Common commands (confirmed in `package.json`)
- Start dev server (uses the custom server): `npm run dev`  (invokes `node server.js`).
- Build for production: `npm run build` then `npm start` (starts `server.js` with NODE_ENV=production).
- Lint: `npm run lint` (uses `next lint`).
- Unit / fast tests: `npm run test` (Vitest). Specific targets: `test:unit`, `test:integration`, `test:api`.
- E2E: `npm run test:e2e` (Playwright); Playwright config lives at `playwright.config.ts` / `playwright.config.js`.

## Architecture & where to look (quick map)
- Routing & UI: `src/app` (App Router), `src/components` (reusable UI), `src/app/*/page.tsx` pages and route handlers.
- Business logic / helpers: `src/lib` (data fetchers, feature helpers).
- State & auth: `src/contexts` and `@supabase/auth-helpers-nextjs` integration in server-side code.
- Hooks: `src/hooks` for composable data/UX logic.
- Types: `src/types` contains shared TypeScript types and domain models.
- Middleware: `src/middleware.ts` — review before altering global request behavior.

## Data, integrations & DB
- Supabase is the primary persistence/storage provider (see SQL under `/sql`, `setup-supabase-schema.js`, and `supabase_schema*.sql`). Preserve migration-style filenames (STEP_*, V1__, V2__) when adding DB changes.
- File ingestion and parsing code references: check `csv-*`, `pdf-*` helpers under `src/lib` and `server.js` for upload handling. `multer`, `pdf-parse`, `tesseract.js` and `pdf-lib` are used.
- Background jobs and queues: `bullmq`, Redis and `ioredis` are present — search for job handler files when adding queue tasks.

## Testing & CI patterns
- Unit tests: Vitest + @testing-library — configs in `vitest.config.ts` and `jest.config.js` (legacy/tests). `jest.setup.js` is present for any Jest-specific mocks.
- Playwright E2E: configs and example specs live under `e2e/` and `tests/e2e`.
- Accessibility checks: `@axe-core/playwright` is installed and used in test suites.

## Project-specific conventions (do not assume defaults)
- The app uses a custom Node server (`server.js`). Do not replace `node server.js` with `next dev` without checking why the custom server exists (SSR proxies, legacy routes, special socket handling).
- SQL-first DB changes: update or add files inside `/sql` with clear migration-style names (e.g., `V2__add_unique_constraint_to_transactions.sql`) and keep `setup-supabase-schema.js` in sync.
- Prefer adding shared utilities to `src/lib` and domain types to `src/types` rather than scattering types across components.
- When adding UI components, follow existing structure in `src/components` and use Tailwind utility classes via `tailwind.config.js`. Use `class-variance-authority` patterns where present.

## Integration points to check before editing
- Supabase: check `setup-supabase-schema.js`, `supabase_schema*.sql`, and any `@supabase/*` usage.
- OpenAI / AI tasks: `openai` is a dependency — search for `openai` usage before changing prompt handling.
- Payment & external services: `stripe`, `plaid`, `razorpay`, `resend` may be integrated — verify credentials and test endpoints.

## Examples (patterns to follow)
- Data fetcher pattern: look at `src/lib/*` for standardized fetch + zod validation before returning to UI.
- Context + hook: `src/contexts/*` expose providers used by `src/hooks/*` then consumed in `src/app/layout.tsx`.
- Tests: unit test files live under `tests/unit` or alongside code; E2E specs are under `e2e/` or `tests/e2e`.

## Safety & quick checks
- Running `npm run dev` should start the custom server. If something fails, check `server.js` for special env requirements.
- Before modifying DB schema, run the SQL scripts locally or via `setup-supabase-schema.js` to validate changes.

## If you need more context
- Useful files to open first: `server.js`, `next.config.js`, `src/app`, `src/lib`, `/sql/*`, `setup-supabase-schema.js`, `playwright.config.ts`, `vitest.config.ts`.

---
If anything here is unclear or you want the instructions to emphasize a different area (for example—test authoring, schema migrations, or the AI prompt layer), tell me which section to expand and I’ll iterate.