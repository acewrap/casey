import { test, expect } from '@playwright/test';

test('capture screenshots', async ({ page }) => {
  // Set viewport for high-quality screenshots
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Mock API responses for clean screenshots
  await page.route('**/api/events/', async route => {
    const json = [
        {
          id: 1,
          source: 'CROWDSTRIKE',
          title: 'Malware Detected: trojan.win32.emotet',
          status: 'NEW',
          severity: 'HIGH',
          mitre_tactics: ['Execution', 'Defense Evasion'],
          indicators: [
            { value: '192.168.1.105', indicator_type: 'IPv4' },
            { value: 'a1b2c3d4...', indicator_type: 'MD5' }
          ]
        },
        {
          id: 2,
          source: 'SPLUNK',
          title: 'Excessive Failed Logins: User jdoe',
          status: 'TRIAGED',
          severity: 'MEDIUM',
          mitre_tactics: ['Credential Access'],
          indicators: [
            { value: 'jdoe', indicator_type: 'User' },
            { value: '10.0.0.55', indicator_type: 'IPv4' }
          ]
        },
        {
          id: 3,
          source: 'PROOFPOINT',
          title: 'Phishing Email Detected',
          status: 'NEW',
          severity: 'HIGH',
          mitre_tactics: ['Initial Access'],
          indicators: [
            { value: 'bad-site.com', indicator_type: 'Domain' }
          ]
        }
    ];
    await route.fulfill({ json });
  });

  await page.route('**/api/incidents/', async route => {
      const json = [
          { id: 1, title: 'Incident from CROWDSTRIKE: Malware Detected', status: 'OPEN', onspring_id: '998877' },
          { id: 2, title: 'Incident from SPLUNK: Brute Force Attempt', status: 'INVESTIGATING', onspring_id: '998878' }
      ];
      await route.fulfill({ json });
  });

  // Dashboard
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({ path: '../docs/screenshots/dashboard.png' });

  // Capture individual charts
  const volumeCard = page.locator('div.MuiPaper-root', { hasText: 'Alert Volume by Source' });
  if (await volumeCard.isVisible()) {
      await volumeCard.screenshot({ path: '../docs/screenshots/chart-volume.png' });
  }

  const mttdCard = page.locator('div.MuiPaper-root', { hasText: 'Mean Time To Detect (MTTD)' });
  if (await mttdCard.isVisible()) {
      await mttdCard.screenshot({ path: '../docs/screenshots/chart-mttd.png' });
  }

  // Events
  await page.goto('http://localhost:5173/events');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshots/events.png' });

  // Incidents
  await page.goto('http://localhost:5173/incidents');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshots/incidents.png' });

  // Admin (Placeholder)
  // Since the frontend just renders a placeholder <div> for /admin, this is safe to screenshot
  // without needing a full Django Admin mock.
  await page.goto('http://localhost:5173/admin');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshots/admin.png' });
});
