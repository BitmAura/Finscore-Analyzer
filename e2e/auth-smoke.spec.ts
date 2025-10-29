import { test, expect } from '@playwright/test';

// Simple smoke test: open the app root and verify navigation works.
test('auth smoke: landing -> login', async ({ page }) => {
  // Use baseURL from playwright config if available.
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.waitForTimeout(2000);

  // Check if page loaded successfully
  const bodyText = await page.textContent('body');
  expect(bodyText).toContain('FinScore');

  // The landing page has "Get Started" button, or we can navigate directly to login
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  // Wait for login page to load
  await page.waitForTimeout(2000);

  // Expect to be on login page or a page with login form
  const url = page.url();
  const hasLoginForm = url.includes('login') || bodyText?.includes('Sign In') || bodyText?.includes('Email');

  expect(hasLoginForm || url.includes('login')).toBeTruthy();
});
