# Phase 11: npm Package Prep - Research

**Researched:** 2026-01-20
**Domain:** npm package publishing, CLI tools, security
**Confidence:** HIGH

## Summary

This phase prepares the package for npm publishing by configuring package.json metadata, creating a proper files whitelist, adding MIT license, and ensuring security through controlled file inclusion.

The key insight is that npm publishing uses a **whitelist model** via the `files` field, which is the recommended approach over `.npmignore` blacklisting. The `files` field explicitly declares what gets published, preventing accidental secret exposure. For CLI tools, the `bin` field must match the package name for `npx` to work correctly.

The postinstall script currently runs `playwright install chromium` which has security implications - postinstall scripts are a common attack vector. However, for end users of this CLI tool, browser installation is necessary, so this tradeoff is acceptable for a user-facing CLI.

**Primary recommendation:** Use the `files` field whitelist pattern with only `dist/` included. Rename package to `screenie` with matching bin entry for npx compatibility.

## Standard Stack

### Core Configuration

| Field | Value | Purpose | Why Standard |
|-------|-------|---------|--------------|
| `name` | `screenie` | Package identifier | Short, memorable, matches binary |
| `bin` | `{ "screenie": "./dist/cli.js" }` | CLI entry point | Enables `npx screenie` |
| `files` | `["dist"]` | Whitelist for publishing | Security - only compiled code |
| `main` | `./dist/cli.js` | Entry point | Always included by npm |

### Metadata Fields

| Field | Format | Purpose |
|-------|--------|---------|
| `repository` | `{ "type": "git", "url": "..." }` | Link to source code |
| `bugs` | `{ "url": "https://github.com/.../issues" }` | Issue tracker |
| `homepage` | `https://screenie.xyz` | Project website |

### Files Always Included by npm

These files are automatically included regardless of `files` field:
- `package.json`
- `README.md` (any case, any extension)
- `LICENSE` (any case, any extension)
- `CHANGELOG.md` (if exists)
- File specified in `main` field

Source: [npm/cli wiki](https://github.com/npm/cli/wiki/Files-&-Ignores)

## Architecture Patterns

### Recommended package.json Structure

```json
{
  "name": "screenie",
  "version": "1.0.0",
  "description": "CLI tool for capturing responsive design screenshots using Playwright",
  "type": "module",
  "main": "./dist/cli.js",
  "bin": {
    "screenie": "./dist/cli.js"
  },
  "files": [
    "dist"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/memehalis/screenie.git"
  },
  "bugs": {
    "url": "https://github.com/memehalis/screenie/issues"
  },
  "homepage": "https://screenie.xyz",
  "scripts": {
    "dev": "tsx src/cli/index.ts",
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "smoke-test": "tsx scripts/smoke-test.ts",
    "postinstall": "playwright install chromium",
    "prepublishOnly": "npm run build && npm run test"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "open": "^11.0.0",
    "ora": "^8.0.0",
    "p-limit": "^6.0.0",
    "picocolors": "^1.0.0",
    "playwright": "^1.51.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "execa": "^9.6.1",
    "strip-ansi": "^7.1.2",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.4.0",
    "vitest": "^2.0.0"
  },
  "engines": {
    "node": ">=20"
  },
  "keywords": [
    "responsive",
    "screenshot",
    "playwright",
    "cli",
    "design",
    "testing",
    "screenie"
  ],
  "license": "MIT"
}
```

### Pattern 1: Files Whitelist

**What:** Use `files` array to explicitly whitelist published files
**When to use:** Always - prevents accidental secret exposure
**Why:** More secure than `.npmignore` blacklist approach

```json
{
  "files": [
    "dist"
  ]
}
```

This publishes ONLY:
- `dist/` directory (compiled JS + type definitions)
- `package.json` (automatic)
- `README.md` (automatic)
- `LICENSE` (automatic)

This EXCLUDES (never published):
- `src/` (TypeScript source)
- `.planning/` (planning docs)
- `.env` files (secrets)
- `scripts/` (dev scripts)
- `screenshots/` (output)
- `node_modules/` (always excluded)
- `.git/` (always excluded)

### Pattern 2: Bin Entry Matches Package Name

**What:** Binary name matches package name for npx compatibility
**When to use:** CLI packages
**Why:** `npx screenie` works when bin key matches package name

```json
{
  "name": "screenie",
  "bin": {
    "screenie": "./dist/cli.js"
  }
}
```

When installed globally: `screenie` command available
When run via npx: `npx screenie` works directly

### Pattern 3: Shebang in Entry Point

**What:** `#!/usr/bin/env node` as first line of CLI entry
**When to use:** All CLI tools
**Why:** Allows direct execution without explicit node command

```javascript
#!/usr/bin/env node
// rest of cli.js
```

Source: [npm docs](https://docs.npmjs.com/cli/v7/configuring-npm/package-json/)

### Anti-Patterns to Avoid

- **Using .npmignore instead of files:** Blacklist approach risks accidental inclusion of secrets
- **Bin name different from package name:** Breaks `npx package-name` - requires `npx --package=name binary`
- **Missing shebang:** Script won't execute correctly when run directly
- **Including source in files:** Unnecessarily increases package size, exposes implementation

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| License file | Copy text manually | SPDX standard MIT template | Legal correctness |
| Dry-run verification | Manual file checking | `npm pack --dry-run` | Shows exact files |
| Local testing | Publish to test | `npm link` or `npm pack` | Test before publish |
| Version bumping | Manual editing | `npm version patch/minor/major` | Handles git tags |

**Key insight:** npm provides built-in commands for verification and testing - use them rather than manual processes.

## Common Pitfalls

### Pitfall 1: Secret Exposure via .npmignore

**What goes wrong:** Secrets in .env files get published because developer updated .gitignore but forgot .npmignore
**Why it happens:** `.npmignore` overrides `.gitignore` when both exist
**How to avoid:** Use `files` whitelist instead of `.npmignore`
**Warning signs:** `npm pack --dry-run` shows unexpected files

### Pitfall 2: npx Doesn't Work

**What goes wrong:** `npx screenie` fails or runs wrong command
**Why it happens:** Bin entry key doesn't match package name
**How to avoid:** Ensure `"bin": { "screenie": "..." }` when package name is `screenie`
**Warning signs:** Works with global install but not npx

### Pitfall 3: Missing Shebang

**What goes wrong:** `screenie: command not found` or permission errors
**Why it happens:** Script lacks `#!/usr/bin/env node` shebang
**How to avoid:** Add shebang as first line of dist/cli.js
**Warning signs:** Works with `node dist/cli.js` but not as command

### Pitfall 4: npm link vs npm pack Behavior Difference

**What goes wrong:** Package works with `npm link` but fails when published
**Why it happens:** `npm link` creates symlink to entire project, ignoring `files` field
**How to avoid:** Also test with `npm pack` which respects `files` field
**Warning signs:** Everything works locally but users report missing files

Source: [dev.to article](https://dev.to/scooperdev/use-npm-pack-to-test-your-packages-locally-486e)

### Pitfall 5: Postinstall Script Fails in CI

**What goes wrong:** `playwright install chromium` fails in some CI environments
**Why it happens:** CI may lack system dependencies or use `--ignore-scripts`
**How to avoid:** Document that users may need to run `npx playwright install chromium` manually
**Warning signs:** Works locally but fails in Docker/CI

## Code Examples

### MIT LICENSE File

```
MIT License

Copyright (c) 2026 memehalis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Source: [choosealicense.com](https://choosealicense.com/licenses/mit/)

### Verification Commands

```bash
# Preview what will be published
npm pack --dry-run

# Expected output for screenie:
# npm notice
# npm notice package: screenie@1.0.0
# npm notice === Tarball Contents ===
# npm notice 40kB  dist/cli.js
# npm notice 3.5kB dist/cli.d.ts
# npm notice 1.0kB LICENSE
# npm notice 2.5kB README.md
# npm notice 1.0kB package.json
# npm notice === Tarball Details ===

# Test locally with npm link
cd /path/to/screenie
npm link
screenie --help  # Should work from anywhere

# Alternative: Test with npm pack (more accurate)
npm pack
# Creates screenie-1.0.0.tgz
npm install -g ./screenie-1.0.0.tgz
screenie --help
```

### CLI Entry Point with Shebang

```javascript
#!/usr/bin/env node
// dist/cli.js - This should be output by build process

import { program } from 'commander';
// ... rest of CLI code
```

Note: tsup must be configured to preserve/add shebang. Check `tsup.config.ts` for banner option if needed.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.npmignore` blacklist | `files` whitelist | npm v5+ (2017) | Security improvement |
| Manual version bumps | `npm version` command | Long-standing | Consistent git tagging |
| Global install only | npx execution | npm v5.2+ (2017) | Zero-install usage |
| Trust all postinstall | Security scrutiny | 2020+ | Users run `--ignore-scripts` more often |

**Current best practice:** Always use `files` whitelist, provide clear documentation for postinstall requirements.

## Postinstall Script Considerations

### Current Script
```json
"postinstall": "playwright install chromium"
```

### Security Implications

Postinstall scripts are a known attack vector in npm ecosystem. However, for screenie:
- The script is necessary - Playwright requires browser binaries
- Users expect browser installation for a screenshot tool
- This is documented and transparent behavior

### Alternative Approaches Considered

1. **Remove postinstall, document manual step:** User runs `npx playwright install chromium` after install
   - Pro: No automatic script execution
   - Con: Extra step, users may forget

2. **Use playwright-core instead:** No automatic browser download
   - Pro: Smaller install, user controls browsers
   - Con: Requires more user knowledge

3. **Keep postinstall (recommended):** Automatic browser installation
   - Pro: Works out of box
   - Con: Some CI environments may fail

**Recommendation:** Keep postinstall but document it clearly in README. Add note about `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` for advanced users.

Source: [Playwright docs](https://playwright.dev/docs/browsers)

## Open Questions

1. **GitHub repo URL uncertainty**
   - Context says `github.com/memehalis/screenie` - need to confirm actual URL
   - Recommendation: Use this URL, update if repo name differs

2. **Version number**
   - Currently 1.0.0, appropriate for stable release
   - Recommendation: Keep 1.0.0 if feature-complete, or use 0.x.x if still in development

3. **Author field**
   - Not currently in package.json
   - Recommendation: Add `"author": "memehalis"` or full format with email

## Sources

### Primary (HIGH confidence)
- [npm docs - package.json](https://docs.npmjs.com/cli/v7/configuring-npm/package-json/) - files, bin, repository fields
- [choosealicense.com](https://choosealicense.com/licenses/mit/) - MIT license template
- [OWASP NPM Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html) - Security best practices
- [npm/cli wiki - Files & Ignores](https://github.com/npm/cli/wiki/Files-&-Ignores) - Always included files

### Secondary (MEDIUM confidence)
- [Snyk npm security best practices](https://snyk.io/blog/ten-npm-security-best-practices/) - Dry-run verification
- [dev.to npx explanation](https://dev.to/orlikova/understanding-npx-1m4) - npx behavior
- [dev.to npm pack testing](https://dev.to/scooperdev/use-npm-pack-to-test-your-packages-locally-486e) - Local testing approaches

### Tertiary (LOW confidence)
- WebSearch results for version patterns - verified against npm docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - npm official docs
- Architecture patterns: HIGH - npm official docs + established patterns
- Pitfalls: MEDIUM - combination of official docs and community reports
- Postinstall guidance: MEDIUM - Playwright docs + community experience

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable domain, npm rarely changes)
