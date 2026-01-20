# Phase 10: Integration - Research

**Researched:** 2026-01-20
**Domain:** CLI Integration, Browser Auto-Open, End-to-End Testing
**Confidence:** HIGH

## Summary

Phase 10 focuses on the final integration step: wiring together all existing components, implementing the auto-open report feature (OUT-06), ensuring proper exit codes, and validating the full pipeline with end-to-end testing. The codebase is already 90% complete with 284 passing tests across 9 phases.

The primary remaining requirement is OUT-06: automatically opening the generated HTML report in the user's default browser. This is a well-solved problem in Node.js using the `open` package by Sindre Sorhus, which is the standard cross-platform solution.

The integration phase requires minimal new dependencies (just `open`), minor modifications to existing code (`actions.ts` to call `open()` after report generation), and a comprehensive end-to-end test to validate the full pipeline works correctly.

**Primary recommendation:** Use the `open` package (v11.x) for browser auto-open. Create an e2e test using `execa` to invoke the built CLI as a subprocess and validate output, exit codes, and file generation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| [open](https://github.com/sindresorhus/open) | ^11.0.0 | Open URLs/files in default browser | De facto standard, 12M+ weekly downloads, cross-platform |

### Supporting (Dev Dependencies)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| [execa](https://github.com/sindresorhus/execa) | ^9.0.0 | Execute CLI as subprocess | E2E tests that invoke the built CLI |
| [strip-ansi](https://github.com/chalk/strip-ansi) | ^7.1.0 | Remove ANSI codes from output | Clean CLI output for assertions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| open package | child_process with platform detection | open handles macOS/Linux/Windows/WSL edge cases, much more reliable |
| execa for e2e | spawn with manual handling | execa provides better promise API, stdout/stderr handling |
| subprocess e2e | vitest mocking | Real e2e with subprocess catches integration issues mocking misses |

**Installation:**
```bash
npm install open
npm install -D execa strip-ansi
```

## Architecture Patterns

### Current Architecture (from existing codebase)

```
src/
├── cli/
│   ├── index.ts       # Entry point, wires Commander action
│   ├── commands.ts    # Commander program definition
│   ├── actions.ts     # runCapture orchestrates full pipeline <-- MODIFY
│   ├── validation.ts  # Input validation functions
│   ├── progress.ts    # ProgressSpinner wrapping ora
│   ├── errors.ts      # Error formatting and display
│   └── types.ts       # CLI type definitions
├── engine/            # Browser management, capture logic
├── output/            # File saving, report generation
├── devices/           # Device registry
└── config/            # Default configuration
```

### Pattern 1: Browser Auto-Open Integration

**What:** Call `open()` after `generateReport()` returns the report path
**When to use:** After successful report generation
**Example:**
```typescript
// Source: https://github.com/sindresorhus/open
import open from 'open';

// In actions.ts runCapture(), after generateReport:
const reportPath = await generateReport(reportData, screenshots, outputDir);
console.log(pc.green(`\nReport saved: ${reportPath}`));

// AUTO-OPEN: Open in default browser (non-blocking)
await open(reportPath);
```

**Key considerations:**
- `open()` is async but doesn't wait for browser to close (returns immediately)
- Works with file paths, not just URLs
- Cross-platform: uses `open` on macOS, `xdg-open` on Linux, `start` on Windows
- No need for `{ wait: true }` - we just want to launch, not wait

### Pattern 2: Exit Code Handling

**What:** Ensure process exits with correct codes
**When to use:** CLI completion and error handling
**Example:**
```typescript
// Current handleError in actions.ts already handles this correctly:
// - Exit 0: Success (implicit when no errors)
// - Exit 1: General error
// - Exit 2: Argument/validation error

// The existing implementation is correct:
export function handleError(error: unknown): never {
  if (error instanceof Error) {
    // Validation errors get exit code 2
    if (error.message.includes('Invalid URL') ||
        error.message.includes('Invalid protocol') ||
        error.message.includes('Concurrency') ||
        error.message.includes('Wait buffer')) {
      process.exit(2);
    }
    process.exit(1); // General error
  }
  process.exit(1);
}
```

### Pattern 3: E2E Testing with Subprocess

**What:** Invoke built CLI as external process for true integration testing
**When to use:** Validating full pipeline including process lifecycle
**Example:**
```typescript
// Source: https://www.lekoarts.de/how-to-test-cli-output-in-jest-vitest/
import { execa } from 'execa';
import stripAnsi from 'strip-ansi';

async function invokeCliAsync(args: string[]): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}> {
  try {
    const result = await execa('node', ['./dist/cli.js', ...args]);
    return {
      exitCode: result.exitCode,
      stdout: stripAnsi(result.stdout),
      stderr: stripAnsi(result.stderr),
    };
  } catch (error) {
    // execa throws on non-zero exit
    const execaError = error as { exitCode: number; stdout: string; stderr: string };
    return {
      exitCode: execaError.exitCode ?? 1,
      stdout: stripAnsi(execaError.stdout ?? ''),
      stderr: stripAnsi(execaError.stderr ?? ''),
    };
  }
}
```

### Anti-Patterns to Avoid

- **Mocking open() in integration tests:** For e2e tests, either mock at subprocess level or skip browser-open verification (it's hard to test and not critical)
- **Using wait: true with open():** Browsers don't return useful exit codes, and single-instance browsers return immediately anyway
- **Synchronous file operations in cleanup:** Always use async/await even in cleanup code
- **Testing with production URLs:** Use localhost or controlled test servers for reliable e2e tests

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-platform browser open | Platform detection + spawn | `open` package | WSL edge cases, browser path detection, 10+ years of battle testing |
| CLI subprocess testing | spawn + manual stream handling | `execa` | Promise-based, proper exit code handling, better DX |
| ANSI code stripping | regex replacement | `strip-ansi` | Handles all escape sequences correctly |

**Key insight:** The browser-opening problem has subtle cross-platform differences (xdg-open on Linux varies by distro, Windows start command escaping, WSL bridging). The `open` package handles all these cases.

## Common Pitfalls

### Pitfall 1: Browser Already Running

**What goes wrong:** When `open()` is called and the browser is already running, the command returns immediately after passing the URL to the existing instance
**Why it happens:** Modern browsers use single-instance architecture
**How to avoid:** Don't use `{ wait: true }` expecting to know when user closes the page - it won't work
**Warning signs:** Tests that try to wait for browser closure will hang or fail unpredictably

### Pitfall 2: E2E Test Flakiness

**What goes wrong:** E2E tests that use real network requests fail intermittently
**Why it happens:** Network latency, DNS resolution, server availability
**How to avoid:** Use localhost test server (the existing smoke-test.ts pattern works well) or example.com (stable)
**Warning signs:** Tests pass locally but fail in CI

### Pitfall 3: Exit Code Swallowing

**What goes wrong:** Errors in async code don't propagate to process exit code
**Why it happens:** Unhandled promise rejections or try/catch that doesn't re-throw
**How to avoid:** Ensure all async paths either throw or explicitly call process.exit()
**Warning signs:** CLI returns 0 even when capture fails

### Pitfall 4: Orphan Browser Processes

**What goes wrong:** Browser processes remain after CLI exits on error
**Why it happens:** Error thrown before finally block cleanup runs
**How to avoid:** The existing pattern (browser cleanup in finally block) is correct
**Warning signs:** Multiple chromium processes visible after interrupted runs

### Pitfall 5: Testing open() Package

**What goes wrong:** Trying to unit test that open() was called correctly
**Why it happens:** ESM mocking is complex, and verifying browser opened is system-dependent
**How to avoid:** Either mock with vi.mock at import level, or skip testing the open() call (it's a one-liner)
**Warning signs:** Complex mocking setup that's brittle

## Code Examples

Verified patterns from official sources:

### Opening Report in Default Browser
```typescript
// Source: https://github.com/sindresorhus/open
import open from 'open';

// Simple case - open file in default browser
await open('/path/to/report.html');

// The function returns the child process, but we don't need to wait
// Browser launch is fire-and-forget for our use case
```

### CLI Subprocess Test Pattern
```typescript
// Source: https://www.lekoarts.de/how-to-test-cli-output-in-jest-vitest/
import { describe, it, expect, beforeAll } from 'vitest';
import { execa, ExecaError } from 'execa';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import stripAnsi from 'strip-ansi';

describe('CLI E2E', () => {
  const testOutputDir = '.test-output-e2e';

  beforeAll(() => {
    // Clean up any previous test output
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  it('captures screenshots and generates report', async () => {
    const result = await execa('node', [
      './dist/cli.js',
      'https://example.com',
      '--phones-only',  // Limit devices for faster test
      '-o', testOutputDir,
    ], { reject: false });

    expect(result.exitCode).toBe(0);
    expect(stripAnsi(result.stdout)).toContain('Report saved');
    expect(existsSync(join(testOutputDir))).toBe(true);
  }, { timeout: 60000 });

  it('returns exit code 2 for invalid URL', async () => {
    const result = await execa('node', [
      './dist/cli.js',
      'invalid-url',
    ], { reject: false });

    expect(result.exitCode).toBe(2);
    expect(stripAnsi(result.stderr)).toContain('Invalid');
  });
});
```

### Mocking open() for Unit Tests (if needed)
```typescript
// Source: https://vitest.dev/guide/mocking/modules
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the open package
vi.mock('open', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Then in test:
import open from 'open';

it('opens report in browser after generation', async () => {
  // ... run capture ...
  expect(open).toHaveBeenCalledWith(expect.stringContaining('report.html'));
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| opn package | open package | 2019 | opn renamed to open, same maintainer |
| CommonJS open | ESM-only open v10+ | 2023 | Must use ESM, matches our project setup |
| jest-mock-process | vitest-mock-process | 2023 | Vitest-compatible process mocking |
| Manual process.spawn for CLI tests | execa | Ongoing | Cleaner API, better error handling |

**Deprecated/outdated:**
- `opn` package: Renamed to `open`, use `open` instead
- `node-open` package: Abandoned, use Sindre's `open`
- CommonJS imports of `open`: Package is ESM-only since v10

## Open Questions

Things that couldn't be fully resolved:

1. **Browser open testability**
   - What we know: open() works reliably, but testing it is hard
   - What's unclear: Whether to mock it or just skip testing
   - Recommendation: Don't test the open() call directly - it's a one-liner calling a well-tested package. Test that the report file exists instead.

2. **--no-open flag**
   - What we know: Some CI/automated scenarios may not want browser popup
   - What's unclear: Whether this is a v1 requirement
   - Recommendation: Consider adding `--no-open` flag for CI environments (can be added in this phase or deferred)

## Sources

### Primary (HIGH confidence)
- [open package GitHub](https://github.com/sindresorhus/open) - Installation, API, cross-platform behavior
- [Node.js process documentation](https://nodejs.org/api/process.html) - Exit codes, signal handling
- [Vitest mocking guide](https://vitest.dev/guide/mocking) - Module mocking patterns

### Secondary (MEDIUM confidence)
- [Testing CLI Output in Jest & Vitest](https://www.lekoarts.de/how-to-test-cli-output-in-jest-vitest/) - E2E testing patterns with execa
- [Node.js Exit Codes (GeeksforGeeks)](https://www.geeksforgeeks.org/node-js/node-js-exit-codes/) - Standard exit code conventions
- [vitest-mock-process GitHub](https://github.com/leonsilicon/vitest-mock-process) - Process mocking for Vitest

### Tertiary (LOW confidence)
- WebSearch results for best practices - Validated against official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - open package is universally recommended, well-documented
- Architecture: HIGH - Integration point is clear (actions.ts after generateReport)
- Pitfalls: MEDIUM - Based on common patterns and documentation, not direct experience

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable domain, unlikely to change)
