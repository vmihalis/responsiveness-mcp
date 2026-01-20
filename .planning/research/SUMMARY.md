# Research Summary

**Project:** Screenie v2.0 Open Source Release
**Domain:** CLI Tool Publishing + Web Properties
**Researched:** 2026-01-20
**Confidence:** HIGH

---

## Stack Recommendation

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Landing Page | Vanilla HTML/CSS | Zero deps, instant load, appropriate for single-page CLI marketing |
| Documentation | VitePress ^1.6.4 | Vite-powered, Vue ecosystem, de facto standard for JS/TS project docs |
| Hosting | Netlify | Official Vite partner, generous free tier, static-site focused |
| Demo Assets | VHS (Charmbracelet) | Scriptable, reproducible terminal recordings, high quality GIF output |
| Package Manager | pnpm | Already in use, excellent workspace support for monorepo |

**Key Decision**: Use vanilla HTML/CSS for landing (not Astro) and VitePress for docs (not Starlight). This is simpler than the ARCHITECTURE.md Astro/Starlight recommendation because screenie.xyz is a single static page that does not need a framework.

---

## Features Summary

### Landing Page — Table Stakes
- Clear value proposition ("Capture responsive screenshots from your terminal")
- Installation command front and center (`npm install -g screenie`)
- Demo GIF showing tool in action
- Feature list with icons
- GitHub link + MIT license badge

### Documentation — Table Stakes
- Installation guide (npm global, npx, local)
- Quick start example (30-second path to first success)
- CLI reference (all commands and flags)
- Configuration options (env vars, config file)
- Troubleshooting section (common errors)
- CHANGELOG.md

### npm Package — Table Stakes
- Semantic versioning at 2.0.0
- `repository`, `bugs`, `homepage` fields in package.json
- `files` field whitelist (dist/, README, LICENSE)
- `engines` field (>=20)
- `prepublishOnly` script (build + test)

### Anti-Features (Don't Build)
- Newsletter popup — interrupts evaluation, not appropriate for CLI tool
- Enterprise/pricing section — confuses OSS positioning
- Marketing fluff — developers distrust vague claims
- Animation overload — slow loading, distracting
- Live web playground — HIGH complexity, defer to v2+

---

## Architecture Overview

### Repository Structure

Keep flat structure (do NOT move to monorepo). The project is small enough that:
- `landing/` directory at root for static HTML/CSS
- `docs/` directory at root for VitePress
- CLI source stays at `src/`

**Note:** ARCHITECTURE.md suggested monorepo with `apps/` and `packages/cli/`. This is overkill for the current scope. A monorepo migration can happen if the project grows, but adds unnecessary complexity now.

### Folder Organization

```
screenie/
  src/                    # CLI source (unchanged)
  landing/                # NEW: Static landing page
    index.html
    style.css
    demo.gif
  docs/                   # NEW: VitePress documentation
    .vitepress/
      config.mts
    index.md
    guide/
    api/
  dist/                   # CLI build output
  package.json            # Updated for npm publishing
  LICENSE                 # MIT
  README.md               # Updated with badges, demo
```

### Build Order

1. **npm Package Prep** — Update package.json, add LICENSE, test local install
2. **Demo Creation** — Record with VHS before building landing page
3. **Landing Page** — Build with demo GIF embedded
4. **Documentation** — Set up VitePress, write initial docs
5. **Hosting** — Deploy landing to screenie.xyz, docs to docs.screenie.xyz
6. **Publish** — npm publish after everything is live

---

## Critical Pitfalls to Avoid

| Pitfall | Prevention | Phase |
|---------|------------|-------|
| Secrets exposed in published package | Use `files` field as whitelist, run `npm pack --dry-run` before every publish | npm setup |
| Missing or wrong shebang | Ensure `#!/usr/bin/env node` first line of dist/cli.js, test with `npm link` | npm setup |
| No quick start in docs | Demo in first 10 seconds, show command + output immediately | Documentation |
| Marketing speak on landing page | Direct technical language, show actual CLI commands and output | Landing page |
| No LICENSE file | Add MIT LICENSE before first public release, add to package.json | npm setup |

---

## Positioning

Screenie v2.0 is a **professional open source release** of an existing CLI tool. The goal is credibility and discoverability: proper npm metadata, clear documentation, and a landing page that communicates value in 5 seconds. This is not a feature release — the CLI is already complete. This is about packaging and presentation for public consumption. Success means developers can find screenie via npm search, understand what it does instantly, install it in one command, and capture their first screenshots within 60 seconds.

---

*Research completed: 2026-01-20*
