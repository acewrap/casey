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
            { id: 1, value: '192.168.1.105', indicator_type: 'IPv4' },
            { id: 2, value: 'a1b2c3d4...', indicator_type: 'MD5' }
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
            { id: 3, value: 'jdoe', indicator_type: 'User' },
            { id: 4, value: '10.0.0.55', indicator_type: 'IPv4' }
          ]
        },
        {
          id: 3,
          source: 'PROOFPOINT',
          title: 'Phishing Email Detected',
          status: 'FALSE_POSITIVE',
          severity: 'HIGH',
          mitre_tactics: ['Initial Access'],
          indicators: [
            { id: 5, value: 'bad-site.com', indicator_type: 'Domain' }
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

  await page.route('**/api/investigations/', async route => {
      const json = [
          {
              id: 1,
              event: {
                  id: 1,
                  title: 'Malware Detected: trojan.win32.emotet',
                  severity: 'HIGH',
                  description: 'CrowdStrike detected malicious activity on endpoint WKSTN-01.'
              },
              created_at: new Date().toISOString()
          }
      ];
      await route.fulfill({ json });
  });

  await page.route('**/api/investigations/1/', async route => {
      const json = {
          id: 1,
          event: {
              id: 1,
              source: 'CROWDSTRIKE',
              title: 'Malware Detected: trojan.win32.emotet',
              severity: 'HIGH',
              description: 'CrowdStrike detected malicious activity on endpoint WKSTN-01.',
              created_at: new Date().toISOString()
          },
          description: '# Analysis\n\n- Verified hash in VirusTotal (Malicious)\n- Isolated host\n- Pending re-image',
          tags: ['malware', 'urgent'],
          timeline: [
              { timestamp: new Date().toISOString(), entry: 'Investigator assigned', user: 'jdoe' }
          ],
          indicators: [
              { id: 1, value: '192.168.1.105', indicator_type: 'IPv4' },
              { id: 2, value: 'a1b2c3d4...', indicator_type: 'MD5' }
          ],
          related_events: [],
          created_at: new Date().toISOString()
      };
      await route.fulfill({ json });
  });

  await page.route('**/api/charts/', async route => {
      const json = [
          { id: 1, title: 'Alerts by Source', chart_type: 'BAR' },
          { id: 2, title: 'Alerts by Severity', chart_type: 'PIE' }
      ];
      await route.fulfill({ json });
  });

  // Dashboard
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '../docs/screenshots/dashboard.png' });

  // Events
  await page.goto('http://localhost:5173/events');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshots/events.png' });

  // Incidents
  await page.goto('http://localhost:5173/incidents');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshots/incidents.png' });

  // Active Investigations
  await page.goto('http://localhost:5173/investigations');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshots/investigations.png' });

  // Investigation Detail
  await page.goto('http://localhost:5173/investigations/1');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshots/investigation_detail.png' });

  // Reporting
  await page.goto('http://localhost:5173/reporting');
  await page.waitForTimeout(2000); // Wait for charts to render
  await page.screenshot({ path: '../docs/screenshots/reporting.png' });
});
