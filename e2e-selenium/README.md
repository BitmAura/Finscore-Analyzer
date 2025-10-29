# Selenium + TestNG E2E for FinScore Analyzer

This module provides Selenium-based end-to-end tests using TestNG.

## Prerequisites
- Java 17+
- Maven 3.8+
- Chrome (default) or Edge/Firefox installed

Drivers are auto-managed by WebDriverManager (no manual setup required).

## Config
Tests read configuration from environment variables (or Maven system properties):

- BASE_URL (default: http://localhost:3000)
- HEADLESS (default: true)
- BROWSER (chrome|edge|firefox; default: chrome)
- TEST_EMAIL (optional; required to run login/dashboard tests)
- TEST_PASSWORD (optional; required to run login/dashboard tests)

## Run
1. Start the dev server at the repo root:

```powershell
npm run dev
```

2. In another terminal, run tests:

```powershell
cd e2e-selenium
mvn test -DHEADLESS=true -DBROWSER=chrome -DBASE_URL=http://localhost:3000 `
  -DTEST_EMAIL=$env:TEST_EMAIL -DTEST_PASSWORD=$env:TEST_PASSWORD
```

If TEST_EMAIL/PASSWORD are not set, only public/health tests will run; auth-dependent tests will be skipped.

## Structure
- `BaseTest` – Driver lifecycle and browser selection
- `HealthReadinessTest` – Probes `/api/health` and `/api/readiness`
- `PublicRoutesTest` – Basic checks for `/` and `/login`
- `AuthFlowTest` – Optional login via email/password (skips if creds missing)
- `DashboardTest` – Simple dashboard smoke checks (requires creds)
- `CommandPaletteTest` – Opens palette (Ctrl+K) and navigates to My Reports
- `LogoutTest` – Clears session via API and verifies redirect

## Notes
- Selectors use robust text-based queries to avoid coupling; consider adding `data-testid` attributes for critical elements to make tests more stable.
- You can switch to Edge by `-DBROWSER=edge`.
