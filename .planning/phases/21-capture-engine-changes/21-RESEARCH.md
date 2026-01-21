# Phase 21: Capture Engine Changes - Research

**Researched:** 2026-01-21
**Domain:** Playwright screenshot capture modes
**Confidence:** HIGH

## Summary

Playwright's `page.screenshot()` method has a `fullPage` boolean option that controls capture mode. By default, `fullPage: false` captures only the current viewport (visible area), while `fullPage: true` captures the entire scrollable page by automatically scrolling and stitching.

The current codebase (v2.2) hardcodes `fullPage: true` in `src/engine/capturer.ts` line 70. This phase inverts the default behavior: viewport-only becomes the new default, with full-page available via a `--full-page` CLI flag.

This is a breaking change requiring a major version bump (v2.2 → v3.0) per semantic versioning, as it changes default behavior of the CLI tool's public API.

**Primary recommendation:** Simply toggle the `fullPage` parameter based on a new CLI flag, pass it through the existing capture options pipeline.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Playwright | ^1.51.0 | Browser automation | Already in use, provides screenshot API |
| Commander.js | ^12.0.0 | CLI parsing | Already in use, supports boolean flags |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | ^2.0.0 | Testing framework | Already in use for unit tests |

### No New Dependencies Required
This phase uses existing infrastructure - no new packages needed.

**Installation:**
```bash
# No new dependencies - already installed
```

## Architecture Patterns

### Recommended Changes Structure
```
src/
├── engine/
│   ├── types.ts         # Add fullPage to CaptureOptions
│   └── capturer.ts      # Use fullPage from options (line 70)
├── cli/
│   ├── types.ts         # Add fullPage to CLIOptions
│   ├── commands.ts      # Add --full-page flag
│   ├── actions.ts       # Pass fullPage to capture engine
│   └── __tests__/
│       └── commands.test.ts  # Test flag parsing
└── engine/__tests__/
    └── capturer.test.ts # Update tests for viewport-only default
```

### Pattern 1: CLI Flag → Engine Option Pipeline
**What:** Thread boolean flag through CLI → action handler → engine options
**When to use:** Any time CLI flag affects capture behavior
**Example:**
```typescript
// 1. CLI: commands.ts
program.option('--full-page', 'Capture full scrollable page instead of viewport-only')

// 2. Types: cli/types.ts
export interface CLIOptions {
  // ... existing options
  fullPage?: boolean;
}

// 3. Action: actions.ts
export async function runCapture(
  urlArg: string,
  pathArg: string | undefined,
  options: CLIOptions
): Promise<void> {
  // ...
  const result = await captureAllDevices(
    manager,
    fullUrl,
    devices,
    {
      timeout: defaultConfig.timeout,
      waitBuffer,
      fullPage: options.fullPage ?? false, // Default: viewport-only
    },
    // ...
  );
}

// 4. Engine: capturer.ts
export async function captureScreenshot(
  manager: BrowserManager,
  options: CaptureOptions
): Promise<ScreenshotResult> {
  const { fullPage = false } = options; // Default: viewport-only

  // Line 69-70: Change from hardcoded true to dynamic
  const buffer = await page.screenshot({
    fullPage, // Was: fullPage: true
    type: 'png',
    scale: 'css',
    animations: 'disabled',
    timeout: screenshotTimeout,
  });
}
```

### Pattern 2: Commander.js Boolean Flag
**What:** Boolean option with no value argument
**When to use:** On/off switches that default to false
**Example:**
```typescript
// Source: Commander.js documentation
program.option('--full-page', 'Description')

// Usage:
// screenie <url>             → fullPage: undefined (falsy, becomes false)
// screenie <url> --full-page → fullPage: true
```

### Anti-Patterns to Avoid
- **Don't add flag to `capturer.ts` directly:** Thread through `CaptureOptions` type for consistency
- **Don't change existing test fixtures without understanding:** Tests currently expect full-page behavior
- **Don't forget type updates:** Add `fullPage?: boolean` to both `CLIOptions` and `CaptureOptions` interfaces

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CLI flag parsing | Custom argv parser | Commander.js `.option()` | Already integrated, tested, documented |
| Screenshot capture | Custom browser screenshot | Playwright `page.screenshot()` | Handles scrolling, stitching, animations |
| Type definitions | Runtime validation only | TypeScript interfaces | Compile-time safety, IDE autocomplete |

**Key insight:** This phase modifies existing infrastructure, not builds new systems. Use what's already proven.

## Common Pitfalls

### Pitfall 1: Forgetting Viewport Height Varies by Device
**What goes wrong:** Developer assumes viewport-only screenshots are all same height
**Why it happens:** Each device has different viewport dimensions (testPhone: 844px vs testDesktop: 1080px)
**How to avoid:** Screenshot height = device.height (not page content height)
**Warning signs:** Tests expecting specific pixel dimensions fail

### Pitfall 2: Full-Page vs Viewport with Lazy-Loaded Images
**What goes wrong:** Viewport-only screenshots may miss lazy-loaded content that only triggers on scroll
**Why it happens:** The existing `scrollForLazy` logic (line 64-66 in capturer.ts) only runs for full-page captures in intent
**How to avoid:** `scrollForLazy` option should work independently of `fullPage` option - both features are orthogonal
**Warning signs:** Users report missing images in viewport-only mode

### Pitfall 3: Breaking Change Without Major Version Bump
**What goes wrong:** Publishing v2.3.0 when default behavior changes breaks user expectations
**Why it happens:** Developer forgets semantic versioning rules for CLI tools
**How to avoid:** This is a breaking change - default screenshot output changes. Requires v3.0.0 per semver.
**Warning signs:** Users complain "screenshots suddenly different after update"

### Pitfall 4: Test Fixture Assumptions
**What goes wrong:** Existing tests fail because they assume full-page behavior
**Why it happens:** Tests don't explicitly set `fullPage: true` in CaptureOptions fixtures
**How to avoid:** Update test fixtures OR update expectations for viewport-only behavior
**Warning signs:** Test "should capture full-page content" (line 86-100) fails with "buffer too small"

### Pitfall 5: Viewport Width Configuration Conflict
**What goes wrong:** Setting viewport explicitly may cause issues with full-page screenshots
**Why it happens:** GitHub issue #13339 reports viewport width can conflict with fullPage option
**How to avoid:** Device viewport is already set via `BrowserManager.createContext()` - no additional viewport manipulation needed
**Warning signs:** Full-page screenshots fail with "Unable to set viewport width and capture fullpage screenshot"

## Code Examples

Verified patterns from official sources and current codebase:

### Viewport-Only Screenshot (New Default)
```typescript
// Source: Playwright official docs
// https://playwright.dev/docs/api/class-page#page-screenshot
await page.screenshot({
  fullPage: false, // Default: captures visible viewport only
  type: 'png',
  scale: 'css',
  animations: 'disabled',
});
// Result: Screenshot height = viewport height (device.height)
// For testPhone (390x844): Image will be ~844px tall
```

### Full-Page Screenshot (Via --full-page Flag)
```typescript
// Source: Current codebase (capturer.ts line 69-75)
await page.screenshot({
  fullPage: true, // Scrolls and stitches entire page
  type: 'png',
  scale: 'css',
  animations: 'disabled',
  timeout: screenshotTimeout,
});
// Result: Screenshot height = full scrollable page content height
// Could be 2000px, 5000px, whatever the page's full height is
```

### Commander.js Boolean Flag Parsing
```typescript
// Source: Current codebase (commands.ts) + Commander.js docs
program.option('--full-page', 'Capture full scrollable page instead of viewport-only')

// Test parsing:
program.parse(['node', 'cli', 'http://localhost:3000', '--full-page']);
expect(program.opts().fullPage).toBe(true); // camelCase from kebab-case

program.parse(['node', 'cli', 'http://localhost:3000']);
expect(program.opts().fullPage).toBeUndefined(); // Not specified
```

### Passing Flag to Capture Engine
```typescript
// Source: Current codebase (actions.ts lines 70-84)
const result = await captureAllDevices(
  manager,
  fullUrl,
  devices,
  {
    timeout: defaultConfig.timeout,
    waitBuffer,
    fullPage: options.fullPage ?? false, // NEW: default to false
  },
  {
    concurrency,
    onProgress: (done, total, res) => {
      spinner.update(done, total, res.deviceName, res.success);
    },
  }
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full-page default | Viewport-only default | v3.0 (this phase) | Breaking change, major bump required |
| Hardcoded `fullPage: true` | Dynamic `fullPage` option | v3.0 (this phase) | Flexibility for users |

**Current v2.2 behavior:**
- `capturer.ts` line 70: `fullPage: true` (hardcoded)
- Every screenshot captures entire scrollable page
- No way to get viewport-only screenshots

**v3.0 behavior (this phase):**
- `capturer.ts` line 70: `fullPage` (from options, defaults to false)
- `screenie <url>` captures viewport-only (new default)
- `screenie <url> --full-page` captures full-page (opt-in)

## Open Questions

Things that couldn't be fully resolved:

1. **Should scrollForLazy work with viewport-only mode?**
   - What we know: Current code scrolls for lazy content (line 64-66)
   - What's unclear: Does it make sense to scroll if only capturing viewport?
   - Recommendation: Keep `scrollForLazy` independent of `fullPage`. Scrolling loads content, then viewport-only captures top portion. User might want lazy content loaded even if only capturing viewport (e.g., content affects layout above fold).

2. **Do existing tests need full-page behavior or can they accept viewport-only?**
   - What we know: Test on line 86-100 named "should capture full-page content"
   - What's unclear: Is this testing the feature or just that screenshot works?
   - Recommendation: Check if tests validate specific behavior or just successful capture. If latter, update test name to "should capture viewport content". If former, add `fullPage: true` to options.

3. **Should help text explain viewport vs full-page?**
   - What we know: Commander help text is in commands.ts addHelpText()
   - What's unclear: Do users understand "viewport-only" terminology?
   - Recommendation: Add help text example: `screenie http://localhost:3000 --full-page  # Capture entire scrollable page`

## Sources

### Primary (HIGH confidence)
- [Playwright Screenshots Documentation](https://playwright.dev/docs/screenshots) - Official docs confirming fullPage: false default
- Current codebase: `src/engine/capturer.ts` lines 69-75 - Current implementation
- [Semantic Versioning 2.0.0](https://semver.org/) - Breaking change guidance
- [Commander.js Documentation](https://github.com/tj/commander.js) - Boolean flag patterns

### Secondary (MEDIUM confidence)
- [Checkly Playwright Screenshots Guide](https://www.checklyhq.com/docs/learn/playwright/taking-screenshots/) - Best practices
- [CLI Design Guidelines](https://clig.dev/) - Flag design best practices
- [ZenRows Playwright Screenshot Guide 2026](https://www.zenrows.com/blog/playwright-screenshot) - Current year best practices

### Tertiary (LOW confidence - flagged for validation)
- [GitHub Issue #13339](https://github.com/microsoft/playwright/issues/13339) - Viewport width vs fullPage conflict (2022, may be resolved)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing dependencies, no unknowns
- Architecture: HIGH - Simple boolean flag propagation through existing pipeline
- Pitfalls: HIGH - Known issues documented in Playwright and current codebase

**Research date:** 2026-01-21
**Valid until:** ~2026-02-21 (30 days - stable domain, Playwright API unlikely to change)

---

**Ready for planning:** All domains investigated. Planner can create PLAN.md with tasks for:
1. Type updates (CLIOptions, CaptureOptions)
2. CLI flag addition (commands.ts)
3. Engine modification (capturer.ts line 70)
4. Action handler update (actions.ts)
5. Test updates (commands.test.ts, capturer.test.ts)
6. Version bump to v3.0.0 (breaking change)
