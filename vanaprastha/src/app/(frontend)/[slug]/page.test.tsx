import { test, expect } from '@playwright/test'

// src/app/(frontend)/[slug]/page.test.tsx

test.describe('[slug] page', () => {
  test('renders hero and blocks for valid slug', async ({ page }) => {
    await page.goto('/about') // replace with a valid slug in your DB
    await expect(page.locator('article')).toBeVisible()
    await expect(page.locator('[data-testid="hero"]')).toBeVisible()
    await expect(page.locator('[data-testid="blocks"]')).toBeVisible()
  })

  test('redirects for non-existent slug', async ({ page }) => {
    await page.goto('/non-existent-slug')
    await expect(page.locator('[data-testid="payload-redirects"]')).toBeVisible()
  })

  test('renders fallback static content for home if not seeded', async ({ page }) => {
    await page.goto('/home')
    // Replace with a selector or text from your homeStatic fallback
    await expect(page.locator('article')).toBeVisible()
    await expect(page.locator('[data-testid="hero"]')).toBeVisible()
  })

  test('shows LivePreviewListener in draft mode', async ({ page }) => {
    // Simulate draft mode, e.g., by setting a cookie or query param if supported
    await page.goto('/about?draft=true')
    await expect(page.locator('[data-testid="live-preview-listener"]')).toBeVisible()
  })

  test('valid page does not show not-found redirect', async ({ page }) => {
    await page.goto('/about')
    await expect(
      page.locator('[data-testid="payload-redirects"][data-disable-not-found="true"]'),
    ).not.toBeVisible()
  })
})
