# Phase 13: README Polish - Research

**Researched:** 2026-01-20
**Domain:** GitHub README best practices, shields.io badges, markdown image embedding
**Confidence:** HIGH

## Summary

This phase covers creating a polished README.md that communicates screenie's value proposition and enables instant user onboarding. The demo GIF from Phase 12 is ready (52KB, 850x450, 10.56s duration) and needs proper embedding. Industry research shows repositories with comprehensive READMEs get 4x more stars and 6x more contributors, and repos with screenshots get 42% more stars.

The README must follow established patterns for CLI tool documentation: badges at top (4-7 max), demo GIF immediately visible, one-command quick start, and clear feature documentation. For npm packages, shields.io provides dynamic badges that auto-update (version, downloads, license).

**Primary recommendation:** Create README with badge row at top (version, downloads, license), followed by centered demo GIF, one-liner description, quick start with npx command, feature list with CLI options table, and standard sections (installation, usage, contributing, license).

## Standard Stack

The established tools and services for README creation:

### Core
| Service | Purpose | Why Standard |
|---------|---------|--------------|
| shields.io | Dynamic badges | Industry standard, 1.6B+ images/month, used by VS Code, Vue.js, Bootstrap |
| GitHub Markdown | README rendering | Native platform, no external dependencies |
| Simple Icons | Logo images for badges | Comprehensive icon library for tech badges |

### Supporting
| Service | Purpose | When to Use |
|---------|---------|-------------|
| img.shields.io | Badge CDN | All badge image URLs |
| GitHub raw content | Image hosting | Demo GIF stored in repo |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shields.io | badgen.net | Shields.io has better npm integration |
| Repo-hosted GIF | GitHub Releases | Releases keep GIF out of history but adds complexity |
| Markdown images | HTML img tags | HTML required for sizing/alignment control |

## Architecture Patterns

### Recommended README Structure
```
README.md
├── Badges (line 1)
├── Project title + one-liner
├── Demo GIF (centered)
├── Quick Start (npx command)
├── Why screenie? (value prop)
├── Features
├── Installation
├── Usage examples
├── Device coverage
├── Contributing
├── License
```

### Pattern 1: Badge Row
**What:** Horizontal row of shields.io badges at document top
**When to use:** All npm packages and GitHub projects
**Example:**
```markdown
[![npm version](https://img.shields.io/npm/v/screenie)](https://www.npmjs.com/package/screenie)
[![npm downloads](https://img.shields.io/npm/dm/screenie)](https://www.npmjs.com/package/screenie)
[![license](https://img.shields.io/npm/l/screenie)](https://github.com/memehalis/screenie/blob/master/LICENSE)
```
**Source:** [Shields.io NPM Version](https://shields.io/badges/npm-version), [Shields.io NPM Downloads](https://shields.io/badges/npm-downloads)

### Pattern 2: Centered Demo GIF with HTML
**What:** HTML img tag for size control and centering
**When to use:** Demo GIFs that need specific dimensions
**Example:**
```html
<p align="center">
  <img src="demo/demo.gif" alt="screenie demo" width="850">
</p>
```
**Source:** [GitHub image alignment guide](https://gist.github.com/DavidWells/7d2e0e1bc78f4ac59a123ddf8b74932d)

**Note:** GitHub's markdown renderer enforces `max-width: 100%` on images, so explicit width/height attributes are needed for sizing control.

### Pattern 3: Copy-Pasteable Quick Start
**What:** Single command that works immediately
**When to use:** CLI tools with npx support
**Example:**
```markdown
## Quick Start

```bash
npx screenie https://your-site.com
```
```
**Source:** [River README template](https://rivereditor.com/blogs/write-perfect-readme-github-repo)

### Pattern 4: CLI Options Table
**What:** Structured table of all CLI flags and options
**When to use:** CLI tools with multiple options
**Example:**
```markdown
| Option | Description | Default |
|--------|-------------|---------|
| `--phones-only` | Only capture phone devices | all devices |
| `--tablets-only` | Only capture tablet devices | all devices |
| `-c, --concurrency <n>` | Parallel captures (1-50) | auto |
```

### Anti-Patterns to Avoid
- **Too many badges:** Stick to 4-7 badges max; more looks cluttered
- **Markdown-only images:** Use HTML for demo GIFs that need centering/sizing
- **Installation before quick start:** Users want to see value first, then install
- **Buried features:** Feature list should be scannable, not buried in prose
- **Missing copy button hint:** Code blocks should be bash-tagged for GitHub copy button

## Don't Hand-Roll

Problems that have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dynamic version badge | Static text | shields.io `/npm/v/` | Auto-updates on npm publish |
| Download count | Manual updates | shields.io `/npm/dm/` | Real-time from npm registry |
| License display | Static badge | shields.io `/npm/l/` | Reads from package.json |
| GIF hosting | External CDN | GitHub raw content | Version controlled, no external dependency |

**Key insight:** Shields.io badges query npm registry in real-time, so version badges update automatically when you publish new versions.

## Common Pitfalls

### Pitfall 1: GIF Not Auto-Playing on GitHub
**What goes wrong:** Demo GIF shows as static image with play button
**Why it happens:** GitHub converts large GIFs to videos with play controls
**How to avoid:**
1. Keep GIF under 5MB (current demo is 52KB - well under)
2. Ensure GIF is properly encoded with looping enabled
3. Test by viewing raw GitHub URL after push
**Warning signs:** GIF works locally but shows play button on GitHub

### Pitfall 2: Badge URLs Point to Wrong Package
**What goes wrong:** Badges show "not found" or wrong version
**Why it happens:** Package name mismatch or package not published
**How to avoid:**
1. Verify package name exactly matches (`screenie`)
2. Confirm package is published to npm before adding badges
3. Test badge URLs directly in browser
**Warning signs:** Badge shows "not found" or different version than expected

### Pitfall 3: Demo GIF Path Breaks After Push
**What goes wrong:** GIF shows broken image after pushing to GitHub
**Why it happens:** Relative path works locally but not on GitHub
**How to avoid:**
1. Use relative paths from repo root (`demo/demo.gif`)
2. Do NOT use absolute file system paths
3. Verify file is actually committed (not gitignored)
**Warning signs:** Works in local preview, breaks on GitHub

### Pitfall 4: Quick Start Command Fails for Users
**What goes wrong:** Users copy command and get errors
**Why it happens:** Missing npx, wrong node version, typos in docs
**How to avoid:**
1. Document Node.js requirement prominently
2. Test npx command in fresh environment
3. Use exact command that works: `npx screenie <url>`
**Warning signs:** GitHub issues about installation failures

### Pitfall 5: README Too Long/Overwhelming
**What goes wrong:** Users bounce without reading key info
**Why it happens:** Trying to document everything in README
**How to avoid:**
1. Lead with value (demo + quick start) not documentation
2. Keep feature list scannable (bullets or table)
3. Link to full docs for advanced usage
4. Target 200-400 lines max
**Warning signs:** Scroll past 5 screens to reach important info

## Code Examples

Verified patterns for README content:

### Complete Badge Row
```markdown
[![npm version](https://img.shields.io/npm/v/screenie)](https://www.npmjs.com/package/screenie)
[![npm downloads](https://img.shields.io/npm/dm/screenie)](https://www.npmjs.com/package/screenie)
[![license](https://img.shields.io/npm/l/screenie)](https://github.com/memehalis/screenie/blob/master/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
```

### Centered Demo GIF
```html
<p align="center">
  <img src="demo/demo.gif" alt="screenie capturing responsive screenshots" width="850">
</p>
```

### Quick Start Section
```markdown
## Quick Start

Capture screenshots of any website across 57 device viewports:

```bash
npx screenie https://your-site.com
```

That's it! Screenshots are saved to `./screenshots/` and an HTML report opens automatically.
```

### Feature List
```markdown
## Features

- **57 Device Viewports** - Phones, tablets, and desktops from iPhone to 4K displays
- **HTML Report** - Visual grid of all captures, opens automatically
- **Device Presets** - `--phones-only`, `--tablets-only`, `--desktops-only`
- **Parallel Capture** - Configurable concurrency for fast captures
- **Zero Config** - Works out of the box, no setup required
```

### CLI Options Table
```markdown
## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--phones-only` | Only capture phone devices (24 devices) | all |
| `--tablets-only` | Only capture tablet devices (13 devices) | all |
| `--desktops-only` | Only capture desktop devices (20 devices) | all |
| `-c, --concurrency <n>` | Parallel captures (1-50) | auto |
| `-w, --wait <ms>` | Wait after page load | 0 |
| `-o, --output <dir>` | Output directory | ./screenshots |
| `--no-open` | Don't open report in browser | false |
```

### Installation Section
```markdown
## Installation

### Using npx (recommended)

```bash
npx screenie https://your-site.com
```

### Global Install

```bash
npm install -g screenie
screenie https://your-site.com
```

**Requirements:** Node.js 20 or higher
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static version in README | shields.io dynamic badges | 2015+ | Auto-updates on npm publish |
| Markdown image syntax | HTML img tags | Always | Required for sizing/alignment control |
| README as full docs | README + separate docs site | 2020+ | Better onboarding flow |
| Badge images hosted elsewhere | shields.io CDN | 2015+ | Reliable, maintained, trusted |

**Current GitHub Markdown (2026):**
- GitHub converts large GIFs to video with play controls
- `max-width: 100%` enforced on images, use explicit width/height
- `<details>` tags work for collapsible sections
- `align="center"` on `<p>` tags still works for centering

## Open Questions

Things that couldn't be fully resolved:

1. **Badge style preference**
   - What we know: styles available are flat (default), flat-square, plastic, for-the-badge, social
   - What's unclear: Which style matches screenie's branding best
   - Recommendation: Use default `flat` style for professional look, or `for-the-badge` for bold visibility

2. **Additional badges to include**
   - What we know: Essential are version, downloads, license
   - What's unclear: Whether to add TypeScript badge, build status, code coverage
   - Recommendation: Start with essential 4 badges (version, downloads, license, Node.js), add more if CI/coverage is set up

3. **GIF autoplay reliability**
   - What we know: GIFs under 5MB generally autoplay; current demo is 52KB
   - What's unclear: Whether GitHub's GIF-to-video conversion threshold changes
   - Recommendation: Test after initial push, have fallback of linking to raw GIF if needed

## Project-Specific Data

### Device Counts (for README)
- **Phones:** 24 devices (iPhone 16/15/14/SE, Galaxy S24/S23/Z Fold/Z Flip, Pixel 8/7, OnePlus, Xiaomi, Huawei, Oppo)
- **Tablets:** 13 devices (iPad Pro/Air/Mini, Galaxy Tab S9/S8)
- **Desktops:** 20 devices (HD to 4K, MacBooks, Ultrawides, Standard monitors)
- **Total:** 57 devices

### CLI Output Reference
```
screenie [options] <url> [path]

Arguments:
  url                         Base URL to capture
  path                        Page path (default: /)

Options:
  -V, --version               Output version number
  --pages <paths...>          Multiple page paths to capture
  -c, --concurrency <number>  Parallel captures (1-50)
  -w, --wait <ms>             Wait after page load
  --phones-only               Only phone devices
  --tablets-only              Only tablet devices
  --desktops-only             Only desktop devices
  -o, --output <dir>          Output directory
  --no-open                   Don't open report in browser
```

### Demo GIF Details (Phase 12)
- **Path:** `demo/demo.gif`
- **Size:** 52KB (well under 5MB limit)
- **Dimensions:** 850x450
- **Duration:** 10.56 seconds
- **Content:** Shows `screenie https://example.com --phones-only` command, progress output, completion message

## Sources

### Primary (HIGH confidence)
- [Shields.io NPM Version Badge](https://shields.io/badges/npm-version) - Badge syntax and parameters
- [Shields.io NPM Downloads Badge](https://shields.io/badges/npm-downloads) - Download badge intervals (dm, dw, dy)
- [Shields.io NPM License Badge](https://shields.io/badges/npm-license) - License badge syntax
- [GitHub Image Alignment Guide](https://gist.github.com/DavidWells/7d2e0e1bc78f4ac59a123ddf8b74932d) - HTML centering patterns

### Secondary (MEDIUM confidence)
- [River README Template](https://rivereditor.com/blogs/write-perfect-readme-github-repo) - README structure from 500+ repo analysis
- [zoxide README](https://github.com/ajeetdsouza/zoxide) - CLI tool README pattern reference
- [awesome-readme](https://github.com/matiassingers/awesome-readme) - Curated README examples

### Tertiary (LOW confidence)
- WebSearch results for "GitHub README best practices 2026" - General guidance
- WebSearch results for "GitHub markdown GIF autoplay" - GIF behavior notes

## Metadata

**Confidence breakdown:**
- Badge syntax: HIGH - Official shields.io documentation
- README structure: HIGH - Multiple authoritative sources agree
- GIF embedding: MEDIUM - GitHub behavior may vary with updates
- Device counts: HIGH - Direct from source code inspection

**Research date:** 2026-01-20
**Valid until:** 2026-04-20 (shields.io stable, GitHub markdown stable)
