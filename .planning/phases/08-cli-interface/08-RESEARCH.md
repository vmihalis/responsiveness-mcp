# Phase 8: CLI Interface - Research

**Researched:** 2026-01-20
**Domain:** Node.js CLI, Commander.js, argument parsing, terminal UX
**Confidence:** HIGH

## Summary

This phase builds the complete command-line interface for the responsive screenshot capture tool. The project already has Commander.js v12.1.0 installed along with ora (spinners) and picocolors (terminal colors), providing all necessary dependencies. The existing CLI skeleton uses `program` from commander but needs expansion to support all required flags and arguments.

The CLI must integrate with existing modules: BrowserManager, captureAllDevices, getDevices/getDevicesByCategory, saveAllScreenshots, and generateReport. The architecture should separate argument parsing from execution logic to enable testing and maintain clean separation of concerns.

**Primary recommendation:** Use Commander.js with typed options pattern, validate inputs early with clear error messages, structure CLI as thin orchestration layer calling existing modules.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| commander | 12.1.0 | Argument parsing, help generation | Already installed, most popular CLI framework, excellent TypeScript support |
| ora | 8.x | Terminal spinners for progress | Already installed, ESM-first, elegant completion states |
| picocolors | 1.0.0 | Terminal colors | Already installed, lightweight (7kb), fast loading (0.5ms) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @commander-js/extra-typings | 12.x | Strongly typed options | Optional - provides inferred types for action handlers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| commander | yargs | yargs has more features but commander is already installed and sufficient |
| picocolors | chalk | chalk is 101kb vs 7kb, slower load time |
| ora | listr2 | listr2 better for multiple concurrent tasks, ora simpler for single spinner |
| URL validator lib | new URL() | Built-in URL constructor is sufficient for HTTP/HTTPS validation |

**Installation:**
No additional packages required - all dependencies already in package.json.

```bash
# Optional for stronger typing (not required)
npm install -D @commander-js/extra-typings
```

## Architecture Patterns

### Recommended Project Structure
```
src/
└── cli/
    ├── index.ts           # Entry point - minimal orchestration
    ├── commands.ts        # Command definitions and argument parsing
    ├── actions.ts         # Action handlers (business logic)
    ├── validation.ts      # Input validation functions
    └── types.ts           # CLI-specific types (CLIOptions, etc.)
```

### Pattern 1: Thin Entry Point
**What:** CLI entry point does minimal work - parses args and delegates to action handlers
**When to use:** Always for testable CLIs
**Example:**
```typescript
// src/cli/index.ts
#!/usr/bin/env node
import { program } from './commands.js';

program.parse();
```

### Pattern 2: Typed Options with Commander
**What:** Define CLI options with TypeScript types that match Commander's parsed output
**When to use:** For type-safe option handling
**Example:**
```typescript
// src/cli/types.ts
export interface CLIOptions {
  pages?: string[];
  concurrency?: number;
  wait?: number;
  phonesOnly?: boolean;
  tabletsOnly?: boolean;
  desktopsOnly?: boolean;
  output?: string;
}

// src/cli/commands.ts
import { Command } from 'commander';

const program = new Command()
  .name('responsive-capture')
  .description('CLI tool for capturing responsive design screenshots')
  .version('1.0.0')
  .argument('<url>', 'Base URL to capture (e.g., http://localhost:3000)')
  .argument('[path]', 'Page path to capture (default: /)')
  .option('--pages <paths...>', 'Multiple page paths to capture')
  .option('--concurrency <number>', 'Parallel capture limit', parseInt)
  .option('--wait <ms>', 'Wait buffer after page load', parseInt)
  .option('--phones-only', 'Only capture phone devices')
  .option('--tablets-only', 'Only capture tablet devices')
  .option('--desktops-only', 'Only capture desktop devices')
  .option('-o, --output <dir>', 'Output directory')
  .action(runCapture);
```

### Pattern 3: Early Validation with Clear Errors
**What:** Validate all inputs before starting expensive operations
**When to use:** Always - fail fast with helpful messages
**Example:**
```typescript
// src/cli/validation.ts
export function validateUrl(urlString: string): URL {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`Invalid protocol: ${url.protocol}. Use http:// or https://`);
    }
    return url;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid URL: "${urlString}". Example: http://localhost:3000`);
    }
    throw error;
  }
}

export function validateConcurrency(value: number | undefined): number {
  const concurrency = value ?? 10;
  if (concurrency < 1 || concurrency > 50) {
    throw new Error(`Concurrency must be between 1 and 50, got: ${concurrency}`);
  }
  return concurrency;
}
```

### Pattern 4: Action Handler Orchestration
**What:** Action handlers coordinate existing modules without containing business logic
**When to use:** All CLI actions
**Example:**
```typescript
// src/cli/actions.ts
import { BrowserManager, captureAllDevices } from '../engine/index.js';
import { getDevices, getDevicesByCategory } from '../devices/index.js';
import { createOutputDirectory, saveAllScreenshots } from '../output/index.js';
import { generateReport, prepareScreenshotsForReport } from '../output/reporter.js';

export async function runCapture(
  url: string,
  path: string | undefined,
  options: CLIOptions
): Promise<void> {
  // 1. Validate inputs
  const validatedUrl = validateUrl(url);
  const pages = resolvePages(path, options.pages);
  const concurrency = validateConcurrency(options.concurrency);

  // 2. Select devices
  const devices = selectDevices(options);

  // 3. Execute capture using existing modules
  const manager = new BrowserManager();
  try {
    await manager.launch();
    // ... capture logic using captureAllDevices
  } finally {
    await manager.close();
  }
}
```

### Pattern 5: Graceful Cleanup on Errors
**What:** Ensure browser cleanup happens even on errors or signals
**When to use:** Always when managing resources
**Example:**
```typescript
// Wrap main action in try/finally
export async function runCapture(...): Promise<void> {
  const manager = new BrowserManager();
  const spinner = ora('Initializing...').start();

  try {
    await manager.launch();
    spinner.text = 'Capturing screenshots...';
    // ... capture logic
    spinner.succeed('Capture complete!');
  } catch (error) {
    spinner.fail('Capture failed');
    throw error;
  } finally {
    await manager.close();
  }
}
```

### Anti-Patterns to Avoid
- **Calling process.exit() in modules:** Throw errors instead, let entry point decide exit code
- **Mixing parsing with execution:** Keep Command definitions separate from action logic
- **Silent failures:** Always show user-friendly error messages with suggestions
- **No cleanup on error:** Always use try/finally for resource cleanup
- **Testing entry point directly:** Export action handlers for unit testing

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL validation | Regex patterns | `new URL()` constructor | Handles all URL edge cases, throws on invalid |
| Argument parsing | Manual process.argv | Commander.js | Handles short/long flags, help generation, validation |
| Help text | Manual string building | Commander.js `.helpOption()` | Automatic from option definitions |
| Terminal colors | ANSI escape codes | picocolors | Cross-platform, respects NO_COLOR |
| Spinners | setInterval + frames | ora | Handles TTY detection, cleanup on exit |
| Integer parsing | `parseInt()` alone | Commander's `parseInt` coercion | Already handles edge cases |

**Key insight:** Commander.js handles ~90% of CLI complexity. Focus effort on domain-specific validation and clear error messages, not argument parsing edge cases.

## Common Pitfalls

### Pitfall 1: Variadic Options Consuming Following Flags
**What goes wrong:** `--pages /a /b --concurrency 5` may consume `--concurrency` as a page
**Why it happens:** Variadic options are greedy - they consume values until another option
**How to avoid:** Document that variadic options must come last OR use comma separation
**Warning signs:** Missing options in parsed result, unexpected values in pages array

### Pitfall 2: Forgetting Browser Cleanup on Early Exit
**What goes wrong:** Browser process stays open after error or Ctrl+C
**Why it happens:** Early returns or unhandled errors skip cleanup code
**How to avoid:** Always use try/finally, BrowserManager already handles SIGINT/SIGTERM
**Warning signs:** Orphan chromium processes, "address in use" on restart

### Pitfall 3: Blocking Spinner Animation
**What goes wrong:** Spinner freezes during synchronous operations
**Why it happens:** JavaScript is single-threaded, sync code blocks animation
**How to avoid:** Keep all heavy operations async, update spinner text periodically
**Warning signs:** Static spinner during long operations

### Pitfall 4: process.exit() Before Async Cleanup
**What goes wrong:** Cleanup code doesn't run, files may be incomplete
**Why it happens:** `process.exit()` terminates immediately, skipping pending async
**How to avoid:** Let process exit naturally after async operations complete, or await cleanup before exit
**Warning signs:** Truncated output files, incomplete reports

### Pitfall 5: Confusing Exit Codes
**What goes wrong:** Scripts calling this tool can't distinguish error types
**Why it happens:** Using exit code 1 for all errors
**How to avoid:** Use conventional codes: 0 (success), 1 (general error), 2 (argument error)
**Warning signs:** Difficulty debugging CI failures

### Pitfall 6: Mutually Exclusive Flags Not Enforced
**What goes wrong:** User passes `--phones-only --tablets-only` expecting union, gets undefined behavior
**Why it happens:** Commander doesn't enforce mutual exclusivity automatically
**How to avoid:** Validate at runtime, show clear error if multiple device filters specified
**Warning signs:** Unexpected device selection results

## Code Examples

Verified patterns from official sources:

### Commander.js Required Argument with Optional Path
```typescript
// Source: Commander.js README
const program = new Command()
  .argument('<url>', 'Base URL to capture')
  .argument('[path]', 'Optional page path (default: /)')
```

### Variadic Option for Multiple Pages
```typescript
// Source: Commander.js options-variadic.js example
program.option('--pages <paths...>', 'Page paths to capture');

// Usage: responsive-capture http://localhost --pages /home /about /contact
// Result: options.pages = ['/home', '/about', '/contact']
```

### Number Option with Parser
```typescript
// Source: Commander.js README
program.option('--concurrency <n>', 'Parallel limit (default: 10)', parseInt, 10);
```

### Boolean Flags
```typescript
// Source: Commander.js README
program
  .option('--phones-only', 'Only capture phone devices')
  .option('--tablets-only', 'Only capture tablet devices')
  .option('--desktops-only', 'Only capture desktop devices');
```

### Ora Spinner Completion States
```typescript
// Source: Ora GitHub README
import ora from 'ora';

const spinner = ora('Loading...').start();
spinner.text = 'Still loading...';

// On success
spinner.succeed('Done!');

// On failure
spinner.fail('Something went wrong');
```

### Picocolors Usage
```typescript
// Source: Picocolors GitHub
import pc from 'picocolors';

console.log(pc.green('Success!'));
console.log(pc.red('Error:'), pc.bold(message));
console.log(pc.dim('Hint: try --help'));
```

### URL Validation with Built-in
```typescript
// Source: Node.js URL API
function validateUrl(input: string): URL {
  const url = new URL(input); // Throws TypeError on invalid
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('URL must use http:// or https://');
  }
  return url;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| require('commander') | import { Command } from 'commander' | Commander 8+ | ESM-first, better tree shaking |
| Manual color codes | picocolors/chalk | 2020+ | Respect NO_COLOR, cross-platform |
| Global `program` export | `new Command()` instance | Commander 9+ | Better testability, multiple commands |
| Callback-based CLI | async/await action handlers | Node 14+ | Cleaner error handling |

**Deprecated/outdated:**
- `commander.version()` without `Command` instance - use `new Command().version()`
- chalk 4.x CommonJS - chalk 5+ is ESM-only (project uses picocolors)
- `program` singleton - prefer explicit `new Command()` for testing

## Integration Points

This phase integrates with all prior phases. Key interfaces:

### From Device Registry (Phase 2)
```typescript
import { getDevices, getDevicesByCategory } from '../devices/index.js';
import type { Device, DeviceCategory } from '../devices/types.js';

// Get all devices
const allDevices = getDevices(); // Device[]

// Filter by category
const phones = getDevicesByCategory('phones');
const tablets = getDevicesByCategory('tablets');
const desktops = getDevicesByCategory('pc-laptops');
```

### From Browser Engine (Phase 3-5)
```typescript
import { BrowserManager, captureAllDevices } from '../engine/index.js';
import type { ExecutionOptions, CaptureAllResult } from '../engine/types.js';

// Launch browser
const manager = new BrowserManager();
await manager.launch();

// Capture with options
const result = await captureAllDevices(
  manager,
  fullUrl,
  devices,
  { timeout: 30000, waitBuffer: options.wait ?? 500 },
  {
    concurrency: options.concurrency ?? 10,
    onProgress: (completed, total, result) => {
      spinner.text = `Capturing ${completed}/${total}...`;
    }
  }
);

// Always close
await manager.close();
```

### From Output (Phase 6-7)
```typescript
import { createOutputDirectory, saveAllScreenshots } from '../output/index.js';
import { generateReport, prepareScreenshotsForReport } from '../output/reporter.js';

// Create output directory
const outputDir = await createOutputDirectory({ baseDir: './screenshots' });

// Save screenshots
const saveResult = await saveAllScreenshots(results, devices, outputDir);

// Generate HTML report
const screenshots = prepareScreenshotsForReport(results, devices);
await generateReport(reportData, screenshots, outputDir);
```

### From Config (Phase 1)
```typescript
import { defaultConfig } from '../config/defaults.js';

// Use defaults when options not specified
const concurrency = options.concurrency ?? defaultConfig.concurrency;
const waitBuffer = options.wait ?? defaultConfig.waitBuffer;
```

## Testing Patterns

### Unit Testing Action Handlers
```typescript
// src/cli/__tests__/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runCapture } from '../actions.js';

// Mock dependencies
vi.mock('../../engine/index.js', () => ({
  BrowserManager: vi.fn().mockImplementation(() => ({
    launch: vi.fn(),
    close: vi.fn(),
  })),
  captureAllDevices: vi.fn().mockResolvedValue({
    results: [],
    successCount: 0,
    failureCount: 0,
  }),
}));

describe('runCapture', () => {
  it('validates URL before starting capture', async () => {
    await expect(runCapture('invalid', undefined, {}))
      .rejects.toThrow(/Invalid URL/);
  });
});
```

### Testing Validation Functions
```typescript
import { validateUrl, validateConcurrency } from '../validation.js';

describe('validateUrl', () => {
  it('accepts valid http URL', () => {
    expect(validateUrl('http://localhost:3000')).toBeInstanceOf(URL);
  });

  it('rejects non-http protocols', () => {
    expect(() => validateUrl('ftp://example.com'))
      .toThrow(/Invalid protocol/);
  });
});
```

### Testing Command Parsing
```typescript
import { program } from '../commands.js';

describe('CLI argument parsing', () => {
  it('parses required URL argument', () => {
    program.parse(['node', 'cli', 'http://localhost']);
    expect(program.args[0]).toBe('http://localhost');
  });

  it('parses variadic pages option', () => {
    program.parse(['node', 'cli', 'http://localhost', '--pages', '/a', '/b']);
    expect(program.opts().pages).toEqual(['/a', '/b']);
  });
});
```

## Open Questions

Things that couldn't be fully resolved:

1. **Multi-page URL construction strategy**
   - What we know: User provides base URL and page paths
   - What's unclear: Should `/about` become `http://base/about` or `http://base.com/about`?
   - Recommendation: Use URL constructor's path joining: `new URL(path, baseUrl)`

2. **Default output directory name**
   - What we know: Timestamps like `2026-01-20-143025` used currently
   - What's unclear: Should CLI add URL/page info to directory name?
   - Recommendation: Keep timestamp-only for simplicity, URL is in report metadata

3. **Conflicting device filters behavior**
   - What we know: `--phones-only`, `--tablets-only`, `--desktops-only` are separate flags
   - What's unclear: What if user specifies multiple? Error, union, or last-wins?
   - Recommendation: Treat as union (capture all specified categories), document behavior

## Sources

### Primary (HIGH confidence)
- Commander.js v12 GitHub README - argument/option patterns, variadic syntax
- Ora GitHub README - spinner API, completion states
- Picocolors GitHub - color API, performance characteristics
- Node.js URL API documentation - URL constructor validation

### Secondary (MEDIUM confidence)
- [Better Stack Commander.js Guide](https://betterstack.com/community/guides/scaling-nodejs/commander-explained/) - verified patterns
- [CircleCI Testing CLI Article](https://circleci.com/blog/testing-command-line-applications/) - testing strategies
- [Heroku Node.js Error Handling](https://www.heroku.com/blog/best-practices-nodejs-errors/) - exit code conventions

### Tertiary (LOW confidence)
- Various Medium articles on CLI UX - general patterns, needs validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and documented
- Architecture: HIGH - patterns verified against Commander.js examples
- Integration points: HIGH - examined actual codebase interfaces
- Pitfalls: MEDIUM - based on documented issues and common patterns

**Research date:** 2026-01-20
**Valid until:** 90 days (Commander.js v12 stable, unlikely to change)
