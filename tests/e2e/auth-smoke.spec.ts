import { test, expect } from '@playwright/test';

// Simple smoke test: open the app root and verify Login navigation works.
test('auth smoke: landing -> login', async ({ page }) => {
  await page.goto('/');

  // The header or landing page should contain a Login button/link.
  const loginButton = page.getByRole('button', { name: /login/i });
  await expect(loginButton).toBeVisible({ timeout: 5000 });

  await loginButton.click();

  // Expect navigation to /login (or a URL that ends with /login)
  await expect(page).toHaveURL(/\/login/);
});
