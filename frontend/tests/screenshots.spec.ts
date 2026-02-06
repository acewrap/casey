import { test, expect } from '@playwright/test';

test('dashboard screenshot', async ({ page }) => {
  // Mock API responses for Dashboard
  await page.route('**/api/events/', async route => {
    const json = [
      { id: 1, title: 'Malicious PowerShell', source: 'CROWDSTRIKE', severity: 'CRITICAL', status: 'NEW', created_at: new Date().toISOString() },
      { id: 2, title: 'Data Exfiltration to Unknown IP', source: 'NETSKOPE', severity: 'HIGH', status: 'PROCESSING', created_at: new Date().toISOString() },
      { id: 3, title: 'Phishing Email Detected', source: 'PROOFPOINT', severity: 'MEDIUM', status: 'TRIAGED', created_at: new Date().toISOString() }
    ];
    await route.fulfill({ json });
  });

  await page.route('**/api/incidents/', async route => {
    const json = [
       { id: 101, title: 'Ransomware Outbreak', status: 'CONTAINMENT', severity: 'CRITICAL' },
       { id: 102, title: 'Insider Threat Investigation', status: 'INVESTIGATING', severity: 'HIGH' }
    ];
    await route.fulfill({ json });
  });

  await page.goto('http://localhost:5173/'); // Assuming default Vite port
  await page.waitForTimeout(1000); // Allow render
  await page.screenshot({ path: '../docs/screenshots/dashboard.png', fullPage: true });
});

test('incident detail screenshot', async ({ page }) => {
    // Mock specific incident
    await page.route('**/api/incidents/101/', async route => {
        await route.fulfill({ json: {
            id: 101,
            title: 'Ransomware Outbreak',
            description: 'Encrypted files detected on HR server.',
            status: 'CONTAINMENT',
            severity: 'CRITICAL',
            events: [],
            created_at: new Date().toISOString()
        }});
    });

    await page.goto('http://localhost:5173/incidents/101');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '../docs/screenshots/incident_detail.png', fullPage: true });
});
