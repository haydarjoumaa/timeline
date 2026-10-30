import { test, expect } from '@playwright/test'

test('renders the timeline with the demo lanes', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Communications')).toBeVisible()
  await expect(page.getByText('Money')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add lane' })).toBeVisible()
})
