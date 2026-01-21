# Phase 19: ASCII Art Branding - Research

**Researched:** 2026-01-21
**Domain:** CLI branding and terminal text styling
**Confidence:** HIGH

## Summary

ASCII art branding for CLI tools is a well-established pattern in 2026, providing professional identity and improved user experience. The standard approach uses the `figlet` npm package to generate ASCII art from text, integrated into Commander.js version output via a custom action handler. For installation messaging, the consensus in 2026 is to avoid `postinstall` scripts due to security concerns - instead, display welcome messages only on explicit user actions like `--version`.

The current codebase uses Commander.js 12.0.0 with version handling via `.version(__PKG_VERSION__)`, picocolors for terminal styling, and tsup for build-time constant injection. The CLI is well-tested with both unit tests (commander parsing) and e2e tests (subprocess invocation with output verification).

**Primary recommendation:** Use `figlet` with `textSync()` for ASCII art generation, override Commander's default version action with custom handler that displays banner, and skip `postinstall` script entirely due to security best practices.

## Standard Stack

The established libraries/tools for CLI ASCII art branding:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| figlet | 1.6.0+ | ASCII art text generation | Industry standard, 100% JS, supports 300+ fonts, widely used |
| picocolors | 1.0.0+ | Terminal color styling | Already in dependencies, zero-dependencies, fastest color library |
| commander | 12.0.0+ | CLI framework | Already in use, supports custom version handlers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/figlet | 1.7.0 | TypeScript definitions | Already using TypeScript |
| strip-ansi | 7.1.2+ | Remove ANSI codes in tests | Already in devDependencies for testing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| figlet | asciiart-logo | asciiart-logo adds box/panel wrapper but is heavier; figlet gives full control over layout |
| figlet | ascii-art | ascii-art has more features (images, tables) but overkill for simple text banner |
| postinstall script | None needed | Security best practice: avoid postinstall entirely, show banner on --version only |

**Installation:**
```bash
npm install figlet
npm install --save-dev @types/figlet
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── cli/
│   ├── banner.ts          # New: ASCII banner generation + display
│   ├── commands.ts        # Modified: custom version action
│   ├── index.ts           # Existing: CLI entry point
│   └── __tests__/
│       └── banner.test.ts # New: banner output tests
```

### Pattern 1: ASCII Banner Generation (Separate Module)
**What:** Isolated module that generates and formats the ASCII art banner with version and tagline
**When to use:** Allows testing banner output independently from CLI execution

**Example:**
```typescript
// src/cli/banner.ts
import figlet from 'figlet';
import pc from 'picocolors';

export function generateBanner(version: string): string {
  const logo = figlet.textSync('SCREENIE', {
    font: 'Big',           // Bold, readable, fits 80 chars
    horizontalLayout: 'fitted',  // Compress to fit terminal width
    width: 80              // Limit to 80 characters for compatibility
  });

  const versionLine = `Version ${version}`;
  const tagline = 'Capture responsive screenshots across 57 device viewports';

  // Center-align version and tagline under logo
  return `${pc.cyan(logo)}
${pc.dim(versionLine)}
${pc.dim(tagline)}`;
}
```

### Pattern 2: Custom Version Action (Commander.js)
**What:** Override Commander's default version behavior to show ASCII banner instead of plain text
**When to use:** When you want custom output for --version flag

**Example:**
```typescript
// src/cli/commands.ts
import { Command } from 'commander';
import { generateBanner } from './banner.js';

declare const __PKG_VERSION__: string;

export function createProgram(): Command {
  const program = new Command()
    .name('screenie')
    .description('Capture responsive screenshots across 50+ device viewports')
    // Don't use .version() - handle manually instead

    // Custom version action
    .option('-v, --version', 'Display version with ASCII banner')
    .action(() => {
      // If --version flag was passed, show banner and exit
      const opts = program.opts();
      if (opts.version) {
        console.log(generateBanner(__PKG_VERSION__));
        process.exit(0);
      }
      // Otherwise continue with normal capture action
    })

    // Rest of configuration...
    .argument('<url>', 'Base URL to capture')
    // ... other options

  return program;
}
```

**Note:** Commander.js doesn't provide a clean way to override the built-in version formatter. The recommended pattern is to handle version as a regular option and check for it in the action handler.

### Pattern 3: Testing Banner Output
**What:** Test that banner contains expected elements and fits width constraints
**When to use:** Ensure banner displays correctly across environments

**Example:**
```typescript
// src/cli/__tests__/banner.test.ts
import { describe, it, expect } from 'vitest';
import stripAnsi from 'strip-ansi';
import { generateBanner } from '../banner.js';

describe('ASCII Banner', () => {
  it('contains SCREENIE text in ASCII art', () => {
    const banner = generateBanner('2.2.0');
    const plainText = stripAnsi(banner);

    expect(plainText).toContain('SCREENIE');
  });

  it('includes version number', () => {
    const banner = generateBanner('2.2.0');
    const plainText = stripAnsi(banner);

    expect(plainText).toContain('Version 2.2.0');
  });

  it('fits within 80 character width', () => {
    const banner = generateBanner('2.2.0');
    const lines = stripAnsi(banner).split('\n');

    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(80);
    }
  });
});
```

### Anti-Patterns to Avoid
- **Using postinstall script for banner display:** Security risk, blocked by many users/tools, output not visible by default
- **Not testing width limits:** Banner can break in narrow terminals if you don't test max line length
- **Hardcoding version in banner code:** Use __PKG_VERSION__ or read from package.json to stay DRY
- **Complex multi-color gradients:** Not all terminals support full color, keep styling simple with picocolors

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ASCII text generation | Manual character arrays or templates | figlet | 300+ professional fonts, handles spacing/kerning, battle-tested |
| Font selection/rendering | Custom font parser | figlet built-in fonts | Pre-rendered, optimized, width-aware |
| Terminal width detection | process.stdout.columns logic | figlet width option | Handles edge cases, works with limited terminals |
| Version string injection | Reading package.json at runtime | tsup define with __PKG_VERSION__ | Already configured, works at build time, no runtime I/O |
| Install-time messaging | Custom postinstall script | Skip entirely or use bin wrapper | Security concerns, blocked by users |

**Key insight:** ASCII art rendering has subtle complexities (kerning, spacing, width overflow) that figlet solves comprehensively. Building custom solutions leads to edge cases and poor rendering.

## Common Pitfalls

### Pitfall 1: Postinstall Script Execution Failures
**What goes wrong:** Postinstall scripts are blocked by security-conscious users/teams using `--ignore-scripts` flag, or by package managers like pnpm 10+ which disable them by default
**Why it happens:** Supply chain attacks have made postinstall scripts a major security concern in 2026
**How to avoid:** Don't use postinstall for welcome messages. Show banner only on explicit user actions (--version, --help)
**Warning signs:** Users reporting "I installed but never saw the banner"

### Pitfall 2: ASCII Art Too Wide for Terminal
**What goes wrong:** Banner gets line-wrapped or truncated, looking broken in 80-column terminals
**Why it happens:** Some figlet fonts (like "Standard") produce text wider than 80 chars for long words
**How to avoid:** Always set `width: 80` option in figlet, test with long project names, use `horizontalLayout: 'fitted'`
**Warning signs:** Manual testing in wide terminal doesn't reveal the issue

### Pitfall 3: Commander Version Flag Conflicts
**What goes wrong:** Trying to use both `.version()` method and custom version option causes conflicts
**Why it happens:** Commander auto-registers -v and --version when `.version()` is called
**How to avoid:** Either use Commander's built-in version (plain text only) OR handle version as custom option entirely - don't mix
**Warning signs:** Error "option '-v, --version' already exists" or version showing twice

### Pitfall 4: Missing TypeScript Types for Figlet
**What goes wrong:** TypeScript compilation errors for figlet imports
**Why it happens:** Figlet is JavaScript library, types are in separate @types package
**How to avoid:** Install @types/figlet as devDependency
**Warning signs:** `Cannot find module 'figlet' or its corresponding type declarations`

### Pitfall 5: ANSI Codes in Test Assertions
**What goes wrong:** Tests comparing banner output fail due to invisible ANSI color codes
**Why it happens:** picocolors adds ANSI escape sequences that aren't visible but affect string equality
**How to avoid:** Use strip-ansi (already in devDependencies) to remove ANSI codes before asserting
**Warning signs:** Test output "looks the same" but assertion fails

## Code Examples

Verified patterns from research and existing codebase:

### Figlet Basic Usage
```typescript
// Source: https://www.npmjs.com/package/figlet (official docs)
import figlet from 'figlet';

const asciiText = figlet.textSync('SCREENIE', {
  font: 'Big',                    // Font name (see recommended fonts below)
  horizontalLayout: 'fitted',     // Compress horizontally to fit
  verticalLayout: 'default',      // Vertical spacing
  width: 80,                      // Max width in characters
  whitespaceBreak: true           // Break on whitespace when wrapping
});

console.log(asciiText);
```

### Integration with Existing Picocolors Pattern
```typescript
// Source: Existing codebase pattern (src/cli/errors.ts)
import pc from 'picocolors';
import figlet from 'figlet';

export function displayBanner(version: string, tagline: string): void {
  const logo = figlet.textSync('SCREENIE', {
    font: 'Big',
    horizontalLayout: 'fitted',
    width: 80
  });

  // Match existing codebase style: cyan for primary, dim for secondary
  console.log(pc.cyan(logo));
  console.log(pc.dim(`v${version}`));
  console.log(pc.dim(tagline));
}
```

### Version Constant Usage
```typescript
// Source: Existing pattern (src/cli/commands.ts, tsup.config.ts)
declare const __PKG_VERSION__: string;

// tsup injects this at build time via:
// define: { __PKG_VERSION__: JSON.stringify(pkg.version) }
const banner = generateBanner(__PKG_VERSION__);
```

### E2E Test Pattern for Version Output
```typescript
// Source: Existing e2e test pattern (src/cli/__tests__/e2e.test.ts)
import { execa } from 'execa';
import stripAnsi from 'strip-ansi';

it('shows banner with --version', async () => {
  const result = await execa('node', ['./dist/cli.js', '--version']);
  const output = stripAnsi(result.stdout);

  expect(result.exitCode).toBe(0);
  expect(output).toContain('SCREENIE');
  expect(output).toMatch(/\d+\.\d+\.\d+/); // Version number format
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Postinstall welcome scripts | Display on --version only | 2024-2025 | Security: pnpm 10+ disables postinstall by default, best practice shifted |
| Manual ASCII art templates | figlet library | Long-established | Maintainability: fonts as data, not code |
| Custom version handlers | Commander built-in `.version()` | N/A - still mixing both | For custom output, must bypass built-in entirely |
| Colorful gradients in banners | Simple picocolors styling | Ongoing | Compatibility: not all terminals support full color |

**Deprecated/outdated:**
- `postinstall` scripts for messaging: Security concerns make this anti-pattern in 2026
- `asciiart-logo` for simple text: Overkill; figlet is lighter and more flexible for text-only banners
- `chalk` for colors: Replaced by `picocolors` in modern projects (faster, smaller, already in dependencies)

## Open Questions

Things that couldn't be fully resolved:

1. **Should -v show banner or just version number?**
   - What we know: Requirements say "CLI-06: screenie -v alias works identically" to --version
   - What's unclear: Whether "identically" means both show banner, or if -v should be minimal
   - Recommendation: Treat them identically (both show banner) per requirement "works identically"

2. **Which figlet font looks best for "SCREENIE"?**
   - What we know: "Big" is recommended for CLI logos, "Banner" is classic, "Standard" is default
   - What's unclear: Visual testing needed to pick best fit for 8-character word
   - Recommendation: Start with "Big" (recommended for logos), verify fits in 80 chars, fallback to "Standard" if too wide

3. **Should banner include quick-start hint?**
   - What we know: INST-02 requires "quick-start hint" but spec says skip postinstall
   - What's unclear: If we skip postinstall, where does quick-start hint go?
   - Recommendation: Add quick-start hint to --version banner output as fallback location

## Sources

### Primary (HIGH confidence)
- figlet npm package documentation (v1.6.0+) - [figlet Guide: Complete NPM Package Documentation [2025]](https://generalistprogrammer.com/tutorials/figlet-npm-package-guide)
- Commander.js GitHub repository - [GitHub - tj/commander.js](https://github.com/tj/commander.js)
- Existing codebase patterns (commands.ts, errors.ts, e2e.test.ts)
- npm lifecycle scripts official docs - [scripts | npm Docs](https://docs.npmjs.com/cli/v8/using-npm/scripts/)

### Secondary (MEDIUM confidence)
- [50+ Creative ASCII Art Ideas & Examples (2026)](https://orbit2x.com/blog/50-creative-ascii-art-ideas-examples-use-cases) - CLI branding value prop
- [Command Line Interface Guidelines](https://clig.dev/) - Version flag best practices
- [NPM Security - OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html) - Postinstall security concerns
- [Printing ASCII Art in the Shell | Baeldung on Linux](https://www.baeldung.com/linux/shell-printing-ascii-art) - Figlet font recommendations

### Tertiary (LOW confidence)
- [asciiart-logo - npm](https://www.npmjs.com/package/asciiart-logo) - Alternative library reference
- [Node.js ASCII Art: Transforming Text into Visual Delights](https://www.w3tutorials.net/blog/nodejs-ascii-art/) - General ecosystem overview

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - figlet is industry standard, picocolors already in use, Commander.js established
- Architecture: HIGH - Existing codebase patterns clear, test infrastructure proven
- Pitfalls: HIGH - Postinstall security concerns well-documented, width issues verified, Commander conflicts documented in issues

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable domain, infrequent breaking changes)
