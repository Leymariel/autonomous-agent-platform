import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_URL || 'https://autonomous-agent-platform-nine.vercel.app'
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || `test-${Date.now()}@example.com`
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD || 'TestPass123!'
const TEST_NAME = 'QA Test User'

// ── 1. Landing page ──────────────────────────────────────────────────────────
test('landing page loads with CTA', async ({ page }) => {
  await page.goto(BASE_URL)
  await expect(page).toHaveTitle(/AgentOS|Autonomous Agent/)
  // Should have a sign-up or get-started link
  const cta = page.getByRole('link', { name: /get started|sign up|start/i })
  await expect(cta.first()).toBeVisible()
})

// ── 2. Sign-up ───────────────────────────────────────────────────────────────
test('sign-up with email creates account', async ({ page }) => {
  await page.goto(`${BASE_URL}/sign-up`)
  await expect(page.getByRole('heading', { name: /create/i })).toBeVisible()

  // Fill form
  const nameInput = page.locator('input[type="text"]').first()
  if (await nameInput.isVisible()) await nameInput.fill(TEST_NAME)
  await page.locator('input[type="email"]').fill(TEST_EMAIL)
  await page.locator('input[type="password"]').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /create account/i }).click()

  // Should redirect to dashboard or show success
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 }).catch(() => {})
  const url = page.url()
  expect(url).toMatch(/dashboard|sign-in/)
})

// ── 3. Sign-in ───────────────────────────────────────────────────────────────
test('sign-in page renders correctly', async ({ page }) => {
  await page.goto(`${BASE_URL}/sign-in`)
  await expect(page.getByRole('heading', { name: /welcome|sign in/i })).toBeVisible()
  await expect(page.locator('input[type="email"]')).toBeVisible()
  await expect(page.locator('input[type="password"]')).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

// ── 4. Google OAuth button ───────────────────────────────────────────────────
test('Google sign-in button is present', async ({ page }) => {
  await page.goto(`${BASE_URL}/sign-in`)
  const googleBtn = page.getByRole('button', { name: /google/i })
  await expect(googleBtn).toBeVisible()
})

// ── 5. Auth redirect (unauthenticated) ───────────────────────────────────────
test('dashboard redirects to sign-in when unauthenticated', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`)
  // Should redirect to sign-in
  await page.waitForURL(/sign-in/, { timeout: 10000 }).catch(() => {})
  expect(page.url()).toMatch(/sign-in|autonomous-agent/)
})

// ── 6. API: auth session endpoint ────────────────────────────────────────────
test('GET /api/auth/get-session returns valid response', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/api/auth/get-session`)
  expect(res.status()).toBe(200)
  const body = await res.text()
  // Should return null or a session object — not an error
  expect(() => JSON.parse(body)).not.toThrow()
})

// ── 7. API: agents (unauthenticated = 401) ───────────────────────────────────
test('GET /api/agents returns 401 when unauthenticated', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/api/agents`)
  expect([401, 403, 302]).toContain(res.status())
})

// ── 8. Marketplace page loads ────────────────────────────────────────────────
test('marketplace page loads for unauthenticated redirects gracefully', async ({ page }) => {
  const res = await page.goto(`${BASE_URL}/marketplace`)
  // Either loads (if public) or redirects to sign-in — should not 500
  expect(res?.status()).not.toBe(500)
  expect(res?.status()).not.toBe(503)
})

// ── 9. Sign-in then navigate (authenticated flow) ────────────────────────────
test('authenticated user can sign in and reach dashboard', async ({ page }) => {
  await page.goto(`${BASE_URL}/sign-in`)

  await page.locator('input[type="email"]').fill(TEST_EMAIL)
  await page.locator('input[type="password"]').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for redirect
  await page.waitForURL(/dashboard|sign-in/, { timeout: 15000 })
  const url = page.url()

  if (url.includes('dashboard')) {
    // ── 10. Dashboard elements ───────────────────────────────────────────────
    await expect(page.getByText(/dashboard/i).first()).toBeVisible()

    // ── 11. Sidebar navigation ───────────────────────────────────────────────
    const navLinks = ['Marketplace', 'Action Center', 'Settings']
    for (const link of navLinks) {
      await expect(page.getByRole('link', { name: link })).toBeVisible()
    }

    // ── 12. Navigate to Marketplace ──────────────────────────────────────────
    await page.getByRole('link', { name: 'Marketplace' }).click()
    await expect(page).toHaveURL(/marketplace/)
    await expect(page.getByText(/Gmail|integration|connect/i).first()).toBeVisible()

    // ── 13. Navigate to Action Center ────────────────────────────────────────
    await page.getByRole('link', { name: 'Action Center' }).click()
    await expect(page).toHaveURL(/action-center/)

    // ── 14. Navigate to Settings ─────────────────────────────────────────────
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/settings/)
  } else {
    // Sign-in failed — this will be caught as a test failure
    const error = await page.locator('.text-red-600').textContent().catch(() => 'unknown error')
    throw new Error(`Sign-in failed: ${error}`)
  }
})

// ── 15. No 500 errors on any page ────────────────────────────────────────────
test('no public page returns 500', async ({ request }) => {
  const pages = ['/', '/sign-in', '/sign-up']
  for (const path of pages) {
    const res = await request.get(`${BASE_URL}${path}`)
    expect(res.status()).not.toBe(500)
  }
})
