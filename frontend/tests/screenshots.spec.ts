import { test, expect } from '@playwright/test';

test('capture screenshots', async ({ page }) => {
  // Login
  // Note: Since we are using Basic Auth / Session for the API but the frontend
  // currently doesn't implement a login page (it relies on session cookies or assumptions for this demo),
  // we will just visit the pages. *However*, for this screenshot script to work effectively in this
  // detached environment without a full browser session flow, we assume the frontend can load.
  // Given the complexity of setting up a full auth flow in this headless environment for screenshots,
  // we will focus on rendering the UI components.

  // Actually, wait, the Frontend makes API calls. If those fail (401), the UI might look empty.
  // For the purpose of these screenshots, we will rely on the UI rendering the "empty" or "loading" state
  // comfortably, or we'd need to mock the API responses in Playwright.

  // Mock API responses for clean screenshots
  await page.route('**/api/events/', async route => {
    const json = [
        { id: 1, source: 'CROWDSTRIKE', title: 'Malware Detected', status: 'NEW', severity: 'HIGH' },
        { id: 2, source: 'SPLUNK', title: 'Excessive Failed Logins', status: 'TRIAGED', severity: 'MEDIUM' }
    ];
    await route.fulfill({ json });
  });

  await page.route('**/api/incidents/', async route => {
      const json = [
          { id: 1, title: 'Incident from CROWDSTRIKE: Malware Detected', status: 'OPEN', onspring_id: '998877' }
      ];
      await route.fulfill({ json });
  });

  // Dashboard
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({ path: 'docs/screenshots/dashboard.png' });

  // Events
  await page.goto('http://localhost:5173/events');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/screenshots/events.png' });

  // Incidents
  await page.goto('http://localhost:5173/incidents');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/screenshots/incidents.png' });
});
