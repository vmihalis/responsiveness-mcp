---
phase: 1
plan: 4
wave: 3
depends_on: [02-PLAN.md, 03-PLAN.md]
autonomous: true
files_modified:
  - src/engine/browser.ts
  - scripts/smoke-test.ts
---

# Plan 4: Playwright Smoke Test

<objective>
Implement minimal Playwright integration in the browser module and create a smoke test script that launches Chromium and takes a test screenshot.
</objective>

<context>
Dependencies are installed (including Playwright with Chromium) and the skeleton files exist. Now we verify Playwright works correctly by:
1. Implementing basic browser launch/close in src/engine/browser.ts
2. Creating a smoke test script that navigates to a test page and captures a screenshot

This validates the core capability the tool depends on before building out full functionality.
</context>

<tasks>
<task id="1">
Update src/engine/browser.ts to implement a working BrowserManager:
```typescript
import { chromium, Browser } from 'playwright';

export class BrowserManager {
  private browser: Browser | null = null;

  async launch(): Promise<Browser> {
    this.browser = await chromium.launch();
    return this.browser;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  getBrowser(): Browser | null {
    return this.browser;
  }
}

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch();
}
```
</task>

<task id="2">
Create scripts/smoke-test.ts with a complete Playwright smoke test:
```typescript
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

async function smokeTest() {
  console.log('Starting Playwright smoke test...');

  // Ensure output directory exists
  const outputDir = join(process.cwd(), 'screenshots', 'smoke-test');
  await mkdir(outputDir, { recursive: true });

  // Launch browser
  console.log('Launching Chromium...');
  const browser = await chromium.launch();

  // Create context with mobile viewport
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3
  });

  // Navigate and screenshot
  const page = await context.newPage();
  console.log('Navigating to example.com...');
  await page.goto('https://example.com');
  await page.waitForLoadState('networkidle');

  const screenshotPath = join(outputDir, 'smoke-test-screenshot.png');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });
  console.log(`Screenshot saved: ${screenshotPath}`);

  // Cleanup
  await context.close();
  await browser.close();

  console.log('Smoke test completed successfully!');
}

smokeTest().catch(err => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
```
</task>

<task id="3">
Add a "smoke-test" script to package.json scripts section:
```json
"smoke-test": "tsx scripts/smoke-test.ts"
```
</task>

<task id="4">
Run the smoke test with `npm run smoke-test` and verify:
- Chromium launches without errors
- Navigation to example.com succeeds
- Screenshot is captured to screenshots/smoke-test/smoke-test-screenshot.png
- Browser closes cleanly
</task>

<task id="5">
Add screenshots/ to .gitignore if not already present (this is output that should not be committed).
</task>
</tasks>

<verification>
- [ ] src/engine/browser.ts contains working BrowserManager class with launch() and close() methods
- [ ] scripts/smoke-test.ts exists with Playwright test code
- [ ] package.json has "smoke-test" script
- [ ] `npm run smoke-test` completes with exit code 0
- [ ] screenshots/smoke-test/smoke-test-screenshot.png file exists after running smoke test
- [ ] Screenshot file is a valid PNG image (non-zero file size)
- [ ] No orphan Chromium processes remain after test completes
</verification>

<must_haves>
- Playwright launches Chromium and takes a test screenshot
- Screenshot is saved to file system
- Browser closes cleanly without orphan processes
- Smoke test is repeatable (can run multiple times)
</must_haves>
