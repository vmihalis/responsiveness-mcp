# Phase 20: ASCII Banner Terminal Width - Research

**Researched:** 2026-01-21
**Domain:** Node.js TTY/terminal width detection, figlet font sizing
**Confidence:** HIGH

## Summary

Terminal width detection in Node.js is straightforward using `process.stdout.columns`, but requires careful handling of non-TTY environments (pipes, CI) where this property is `undefined`. The current banner uses figlet's "Big" font at 63 characters width, which fits 80-column terminals but fails on narrower displays common in mobile SSH clients (Termux), split terminal panes, and small terminal windows.

Research confirms multiple smaller figlet fonts are available: Small (43 chars), Mini (30 chars), 3x5 (25 chars), and 1Row (17 chars) - all narrower than Big (63 chars). Industry standard fallback thresholds are: 80 columns for standard layout, 40-60 columns for narrow terminals, with plain text fallback below 40 columns.

The solution requires detecting terminal width at runtime, selecting an appropriate font based on width thresholds, and falling back to plain text for very narrow terminals or non-TTY output. This follows CLI best practices for graceful degradation.

**Primary recommendation:** Use `process.stdout.columns` with fallbacks (COLUMNS env var, default 80), implement width-based font selection (Big: >=80, Small: 60-79, Mini: 45-59, plain: <45), and always provide plain text fallback for non-TTY contexts.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| figlet | 1.9.4 | ASCII art generation | Already in use, 260+ fonts included, zero-cost font switching |
| picocolors | 1.0.0 | Terminal color styling | Already in use, auto-detects TTY for color support |

### Node.js Built-ins
| API | Purpose | When to Use |
|-----|---------|-------------|
| process.stdout.columns | Get terminal width | Primary width detection (TTY only) |
| process.stdout.isTTY | Detect TTY vs pipe | Determine if rich output is appropriate |
| process.stdout.rows | Get terminal height | Optional - not needed for banner |
| process.env.COLUMNS | Width fallback | When stdout.columns is undefined |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| strip-ansi | 7.1.2 | Remove ANSI codes | Already in devDeps for testing width calculations |

**Installation:**
No new packages needed - all required tools are already installed.

## Architecture Patterns

### Recommended Function Structure
```
src/cli/
├── banner.ts              # Current: 26 lines
│   ├── generateBanner()   # Existing entry point
│   ├── detectTerminalWidth() # New: width detection with fallbacks
│   ├── selectFont()       # New: font selection based on width
│   └── formatBanner()     # New: layout with version/tagline
```

### Pattern 1: Terminal Width Detection with Fallbacks
**What:** Detect terminal width with multiple fallback strategies
**When to use:** At the start of banner generation, before font selection
**Example:**
```typescript
// Source: Node.js TTY Documentation https://nodejs.org/api/tty.html
function detectTerminalWidth(): number {
  // Try stdout.columns (TTY)
  if (process.stdout.columns) {
    return process.stdout.columns;
  }

  // Fallback to COLUMNS environment variable
  if (process.env.COLUMNS) {
    const parsed = parseInt(process.env.COLUMNS, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // Default to 80 columns (standard terminal width)
  return 80;
}
```

### Pattern 2: Width-Based Font Selection
**What:** Select figlet font based on available terminal width
**When to use:** After detecting width, before generating ASCII art
**Example:**
```typescript
// Source: Empirical testing with figlet fonts for "SCREENIE"
// Big: 63 chars, Small: 43 chars, Mini: 30 chars, 1Row: 17 chars
function selectFont(width: number): string | null {
  if (width >= 80) return 'Big';       // Comfortable fit
  if (width >= 60) return 'Small';     // Narrow but readable
  if (width >= 45) return 'Mini';      // Very narrow
  return null;                         // Too narrow, use plain text
}
```

### Pattern 3: Graceful Degradation to Plain Text
**What:** Fall back to plain text when width is insufficient or non-TTY
**When to use:** When terminal width < minimum threshold OR when stdout is not a TTY
**Example:**
```typescript
// Source: Node.js CLI Apps Best Practices https://github.com/lirantal/nodejs-cli-apps-best-practices
function generateBanner(version: string): string {
  const width = detectTerminalWidth();
  const font = selectFont(width);

  // Plain text fallback
  if (!font || !process.stdout.isTTY) {
    return [
      'SCREENIE',
      `v${version}`,
      'Capture responsive screenshots across 57 device viewports',
      'Run: screenie --help',
      ''
    ].join('\n');
  }

  // Generate ASCII art with selected font
  const asciiLogo = figlet.textSync('SCREENIE', {
    font,
    horizontalLayout: 'fitted',
  });

  // ... rest of banner formatting
}
```

### Pattern 4: Non-TTY Detection
**What:** Detect piped/redirected output where rich formatting is inappropriate
**When to use:** Before generating any TTY-specific output (colors, ASCII art)
**Example:**
```typescript
// Source: Node.js TTY Documentation https://nodejs.org/api/tty.html
if (!process.stdout.isTTY) {
  // Output is piped, redirected, or in CI
  // Skip ASCII art, use plain text
  return generatePlainBanner(version);
}
```

### Anti-Patterns to Avoid
- **Assuming stdout.columns always exists:** It's undefined in non-TTY contexts (pipes, CI)
- **No fallback for narrow terminals:** Causes line wrapping and garbled output on mobile SSH, split panes
- **Using only font width property:** Font width in figlet refers to character cells, not actual rendered width - must test empirically
- **Skipping plain text fallback:** ASCII art in logs/CI is noise - provide clean plain text alternative

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ASCII art generation | Custom letter templates | figlet library | 260+ fonts, proven layouts, handles kerning/spacing |
| Terminal capability detection | Manual TERM parsing | process.stdout.isTTY + columns | Node.js core API, handles all edge cases |
| Color support detection | Environment var parsing | picocolors built-in | Already in use, handles NO_COLOR, FORCE_COLOR, CI |
| ANSI code stripping | Regex patterns | strip-ansi library | Already in devDeps, handles all ANSI escape sequences |

**Key insight:** Terminal capability detection has many edge cases (tmux, screen, SSH, CI environments, Windows, macOS Terminal.app quirks). Using Node.js built-in APIs and battle-tested libraries prevents subtle bugs across platforms.

## Common Pitfalls

### Pitfall 1: Undefined stdout.columns in Non-TTY Contexts
**What goes wrong:** `process.stdout.columns` is `undefined` when output is piped (`screenie --version | cat`), redirected to file, or run in some CI environments. Code crashes if not handled.
**Why it happens:** stdout is only a TTY (and has `columns` property) when attached to an actual terminal. Pipes, redirects, and file writes are not TTYs.
**How to avoid:** Always check `process.stdout.isTTY` before using TTY-specific properties, or provide fallback chain: `stdout.columns || env.COLUMNS || 80`
**Warning signs:**
- Tests fail with "Cannot read property 'columns' of undefined"
- CI builds crash while local runs work
- `screenie --version > log.txt` throws error

### Pitfall 2: Font Selection Based on Font Metadata Instead of Empirical Testing
**What goes wrong:** Figlet fonts have a "width" property in their metadata, but this refers to character cell width, not the actual rendered width of text. Selecting fonts based on metadata leads to text that still doesn't fit.
**Why it happens:** Figlet font files (.flf) contain layout metadata that describes the font structure, not the output dimensions for specific text.
**How to avoid:** Test actual output width by rendering the target text and measuring max line length with actual characters: `Math.max(...figlet.textSync('SCREENIE', {font: 'Big'}).split('\n').map(l => l.length))`
**Warning signs:**
- Font is marked as "narrow" but output still wraps
- Same font renders different widths for different text
- Width calculations don't match actual terminal display

### Pitfall 3: Hard-Coding Width Thresholds Without Context
**What goes wrong:** Using arbitrary numbers (e.g., "if width < 70") without understanding actual font requirements leads to suboptimal UX. Either too aggressive (drops to plain text when Small font would work) or too lenient (tries ASCII art when it wraps).
**Why it happens:** Developer guesses at thresholds without testing actual font widths or considering target text.
**How to avoid:**
1. Measure actual rendered width of target text in each font
2. Add buffer for comfortable reading (font width + 5-10 chars margin)
3. Consider real-world narrow scenarios: mobile SSH typically 40-60 cols, split pane often 80-100 cols
**Warning signs:**
- Banner looks cramped even when it "fits"
- Plain text fallback triggers on wide-enough terminals
- User complaints about banner wrapping on "normal" terminals

### Pitfall 4: Not Providing Manual Override
**What goes wrong:** Automated detection might be wrong (tmux reports wrong width, user has preferences), and users can't fix it.
**Why it happens:** Over-reliance on auto-detection without considering user control needs.
**How to avoid:** Provide environment variable override (e.g., `SCREENIE_BANNER=plain` or `SCREENIE_WIDTH=40`) or CLI flag (e.g., `--no-banner`) per CLI best practices.
**Warning signs:**
- GitHub issues: "banner doesn't fit my terminal"
- No way for users to force plain text in documentation
- Auto-detection fails in specific terminal emulators with no workaround

## Code Examples

Verified patterns from official sources:

### Terminal Width Detection with Full Fallback Chain
```typescript
// Source: Node.js TTY Documentation https://nodejs.org/api/tty.html
// Fallback pattern: Node.js community standard
function getTerminalWidth(): number {
  // 1. Direct TTY detection (most reliable)
  if (process.stdout.isTTY && process.stdout.columns) {
    return process.stdout.columns;
  }

  // 2. COLUMNS environment variable (set by many terminals)
  const envColumns = process.env.COLUMNS;
  if (envColumns) {
    const parsed = parseInt(envColumns, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // 3. Default to standard terminal width
  return 80;
}
```

### TTY vs Non-TTY Output Selection
```typescript
// Source: Node.js CLI Apps Best Practices
// https://github.com/lirantal/nodejs-cli-apps-best-practices (Section 4.2)
export function generateBanner(version: string): string {
  // Check if we should use rich output
  if (!process.stdout.isTTY) {
    return generatePlainBanner(version);
  }

  const width = getTerminalWidth();
  return width < 45
    ? generatePlainBanner(version)
    : generateAsciiBanner(version, width);
}

function generatePlainBanner(version: string): string {
  return [
    'SCREENIE',
    `v${version}`,
    'Capture responsive screenshots across 57 device viewports',
    'Run: screenie --help',
    ''
  ].join('\n');
}
```

### Empirical Font Width Testing
```typescript
// Source: Empirical testing (figlet 1.9.4)
// Run once during development to establish thresholds
function measureFontWidth(text: string, font: string): number {
  const rendered = figlet.textSync(text, {
    font,
    horizontalLayout: 'fitted',
  });

  const lines = rendered.split('\n');
  return Math.max(...lines.map(line => line.length));
}

// Results for "SCREENIE":
// Big: 63 chars
// Small: 43 chars
// Standard: 55 chars
// Mini: 30 chars
// 3x5: 25 chars
// 1Row: 17 chars
```

### Font Selection Based on Width
```typescript
// Source: Derived from CLI best practices and empirical testing
type FontChoice = {
  font: string;
  minWidth: number; // Minimum terminal width for comfortable display
};

const FONT_OPTIONS: FontChoice[] = [
  { font: 'Big', minWidth: 80 },    // 63 chars + 17 char margin
  { font: 'Small', minWidth: 60 },  // 43 chars + 17 char margin
  { font: 'Mini', minWidth: 45 },   // 30 chars + 15 char margin
];

function selectFont(terminalWidth: number): string | null {
  for (const option of FONT_OPTIONS) {
    if (terminalWidth >= option.minWidth) {
      return option.font;
    }
  }
  return null; // Fall back to plain text
}
```

### Width-Aware Banner Generation (Full Pattern)
```typescript
// Source: Integration of Node.js TTY API + figlet + CLI best practices
import figlet from 'figlet';
import pc from 'picocolors';

export function generateBanner(version: string): string {
  // Detect environment capabilities
  const isTTY = process.stdout.isTTY;
  const width = getTerminalWidth();

  // Plain text for non-TTY or very narrow terminals
  if (!isTTY || width < 45) {
    return [
      'SCREENIE',
      `v${version}`,
      'Capture responsive screenshots across 57 device viewports',
      'Run: screenie --help',
      ''
    ].join('\n');
  }

  // Select font based on width
  const font = selectFont(width);
  if (!font) {
    return generatePlainBanner(version);
  }

  // Generate ASCII art with selected font
  const asciiLogo = figlet.textSync('SCREENIE', {
    font,
    horizontalLayout: 'fitted',
    width: Math.min(width, 80), // Cap at 80 for readability
  });

  // Format with color (picocolors auto-detects support)
  const coloredLogo = pc.cyan(asciiLogo);
  const versionLine = pc.dim(`  v${version}`);
  const tagline = pc.dim(
    '  Capture responsive screenshots across 57 device viewports'
  );
  const quickStart = pc.dim('  Run: screenie --help');

  return [coloredLogo, '', versionLine, tagline, quickStart, ''].join('\n');
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed ASCII art size | Responsive width detection | 2020s CLI tools | Better UX on mobile SSH (Termux), split panes |
| Manual TTY checking | process.stdout.isTTY | Node.js v0.10+ (2013) | Standardized, reliable |
| Custom color detection | Libraries like chalk/picocolors | 2015+ (chalk), 2021+ (picocolors) | Handles NO_COLOR, FORCE_COLOR, CI |
| 80-column assumption | Dynamic width with fallbacks | Modern CLI standards | Works in containers, CI, mobile |

**Deprecated/outdated:**
- `tty.isatty(fd)` for stdout: Use `process.stdout.isTTY` instead (higher-level, more reliable)
- Checking `TERM` environment variable for capabilities: Use Node.js properties (columns, isTTY, hasColors)
- Hard-coded 80-column limit: Modern terminals are often wider, but also often narrower (splits, mobile)

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal width buffer/margin for comfort**
   - What we know: Font width (e.g., 63 chars for Big) needs margin for comfortable reading
   - What's unclear: Exact margin amount (10 chars? 15? 20?) - varies by user preference
   - Recommendation: Use 15-17 char margin based on search results showing 80-col as "comfortable" for 63-char content, but make configurable via env var

2. **Handling dynamically resized terminals**
   - What we know: `process.stdout.on('resize')` event exists, updates `columns` property
   - What's unclear: Whether version banner should respond to resize (it's a one-time display on `--version`)
   - Recommendation: Ignore resize for banner (snapshot width at generation time), only relevant for long-running TUI apps

3. **Font preference for 60-80 column range**
   - What we know: Big (63 chars) fits 80+, Small (43 chars) fits 60+, Mini (30 chars) fits 45+
   - What's unclear: In the 60-79 range, is Small font preferred or should we stick with Big if it fits?
   - Recommendation: Use Small for 60-79 range to ensure comfortable margin, reserve Big for 80+ where it has proper space

4. **Manual override mechanism**
   - What we know: CLI best practices recommend manual opt-out (Section 4.2 of Node.js CLI best practices)
   - What's unclear: Environment variable name convention (`SCREENIE_BANNER`, `SCREENIE_WIDTH`, `NO_BANNER`?)
   - Recommendation: Use `SCREENIE_BANNER` env var with values: `auto` (default), `plain`, `big`, `small`, `mini` for explicit control

## Sources

### Primary (HIGH confidence)
- [Node.js TTY Documentation](https://nodejs.org/api/tty.html) - process.stdout properties, isTTY, columns, resize event
- Empirical testing - figlet 1.9.4 font widths for "SCREENIE" text measured directly in this project
- [Node.js CLI Apps Best Practices](https://github.com/lirantal/nodejs-cli-apps-best-practices) - Section 4.2 on graceful degradation

### Secondary (MEDIUM confidence)
- [Command Line Interface Guidelines (clig.dev)](https://clig.dev/) - General CLI UX principles (via search results)
- [Terminal Width Handling - Build Interactive CLI with Enquirer](https://app.studyraid.com/en/read/12628/409783/terminal-width-handling) - Fallback patterns (80-col default, 40-col minimum)
- [Getting Terminal Size in Node](https://www.tobyho.com/2011/10/15/getting-terminal-size-in-node/) - Early documentation on columns property
- [FIGlet Documentation](https://manpages.ubuntu.com/manpages/bionic/man6/figlet-figlet.6.html) - Font options and layout modes
- [Figlet Examples](https://www.figlet.org/examples.html) - Visual examples of different fonts

### Secondary (MEDIUM confidence) - Library-Specific
- [picocolors GitHub](https://github.com/alexeyraspopov/picocolors) - isColorSupported behavior, CI handling
- [chalk GitHub](https://github.com/chalk/chalk) - Terminal string styling patterns
- [supports-color GitHub](https://github.com/chalk/supports-color) - Color capability detection standards

### Tertiary (LOW confidence)
- [40 columns on SSH - awless GitHub issue](https://github.com/wallix/awless/issues/64) - Anecdotal evidence of 40-col narrow terminals in SSH
- [Termux banner projects](https://github.com/currentvai/Curtroder) - Real-world mobile terminal banner implementations
- Various blog posts on terminal width handling - demonstrate patterns but not authoritative

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing dependencies (figlet, picocolors) and Node.js built-ins, verified via package.json and empirical testing
- Architecture: HIGH - Patterns verified with Node.js official documentation and empirical testing of font widths
- Width thresholds: MEDIUM - Based on empirical testing (font widths) and community standards (80/40 columns), but optimal margins are somewhat subjective
- Pitfalls: HIGH - Derived from official Node.js documentation (undefined columns), empirical testing (font metadata vs actual width), and CLI best practices (manual override)

**Research date:** 2026-01-21
**Valid until:** 60 days (stable domain - Node.js TTY API is mature, figlet is stable, patterns are established)

**Research methodology:**
1. Loaded current implementation and context
2. Consulted Node.js official TTY documentation (HIGH confidence)
3. Empirically tested figlet fonts for actual width (HIGH confidence)
4. Cross-referenced CLI best practices from multiple sources (MEDIUM confidence)
5. Verified terminal width standards from documentation and real-world examples (MEDIUM confidence)
6. Identified common pitfalls through issue trackers and documentation caveats (HIGH confidence)
