# Stack Research: Screenie v2.0 Open Source Release

**Project:** screenie (responsive screenshot CLI)
**Researched:** 2026-01-20
**Scope:** Landing page, documentation site, npm publishing, hosting

---

## Landing Page

### Recommendation: Single HTML + CSS (No Framework)

**Why:** For a CLI tool landing page, a framework adds unnecessary complexity. You need:
- Hero section with tagline
- Demo GIF/video
- Installation command (`npm install -g screenie`)
- Links to docs and GitHub

This is achievable with ~200 lines of HTML and ~150 lines of CSS.

**Approach:**
```
landing/
  index.html      # Single HTML file
  style.css       # Vanilla CSS (flexbox/grid)
  demo.gif        # Generated with VHS
  favicon.svg     # Simple icon
```

**Rationale:**
- Zero build step - just deploy the directory
- Fast iteration - edit and refresh
- No dependencies to maintain
- Loads instantly (no JS framework overhead)
- Perfect for a developer-focused CLI tool

**Alternatives Considered:**

| Option | Verdict | Why Not |
|--------|---------|---------|
| Astro | Overkill | Single page doesn't need component system |
| Next.js | Wrong tool | SSR/React for static landing is overhead |
| Tailwind CSS | Acceptable | Adds build step; vanilla CSS sufficient for single page |

**Confidence:** HIGH - This is standard practice for CLI tool landing pages (see: esbuild.github.io, bun.sh patterns)

---

## Documentation Site

### Recommendation: VitePress 1.6.4 (Stable)

**Version:** Use stable 1.6.x, not 2.0 alpha

**Why VitePress:**
1. **Perfect fit for CLI docs:** Designed for technical documentation
2. **Vite-powered:** Sub-second hot reload during writing
3. **Vue ecosystem:** Same author (Evan You), battle-tested
4. **Zero-config default:** Works out of the box with sensible defaults
5. **Used by:** Vue, Vite, Vitest, Pinia, VueUse - proven at scale

**Installation:**
```bash
# Create docs directory
mkdir docs && cd docs

# Initialize VitePress
npm add -D vitepress@^1.6.4

# Setup wizard
npx vitepress init
```

**Project Structure:**
```
docs/
  .vitepress/
    config.mts           # Site configuration
    theme/
      index.ts           # Custom theme (optional)
  index.md               # Home page
  guide/
    getting-started.md
    installation.md
    configuration.md
  api/
    cli-reference.md
    config-file.md
  public/
    logo.svg
```

**Configuration (docs/.vitepress/config.mts):**
```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Screenie',
  description: 'Responsive screenshot CLI',
  base: '/',

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/cli-reference' }
    ],
    sidebar: {
      '/guide/': [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Installation', link: '/guide/installation' },
        { text: 'Configuration', link: '/guide/configuration' }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/memehalis/screenie' }
    ],
    footer: {
      message: 'Released under the MIT License.'
    }
  }
})
```

**Build Commands (add to package.json):**
```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

**Requirements:**
- Node.js 18+
- `"type": "module"` in package.json (already present)

**Alternatives Considered:**

| Option | Verdict | Why Not |
|--------|---------|---------|
| Docusaurus | Good but heavier | React-based, more complex config |
| Nextra | Next.js lock-in | Overkill for static docs |
| MkDocs | Python ecosystem | Different language than project |
| GitBook | Commercial limits | Free tier has restrictions |

**Confidence:** HIGH - VitePress is the standard for JS/TS project documentation

**Sources:**
- [VitePress Official](https://vitepress.dev/)
- [VitePress Getting Started](https://vitepress.dev/guide/getting-started)
- [VitePress npm](https://www.npmjs.com/package/vitepress)

---

## npm Publishing

### Required package.json Updates

Current package.json needs updates for public npm publishing:

**1. Rename Package**
```json
{
  "name": "screenie",
  "version": "2.0.0"
}
```
Note: Check `npm view screenie` to verify name availability.

**2. Update bin Field**
```json
{
  "bin": {
    "screenie": "./dist/cli.js"
  }
}
```

**3. Add exports Field (Modern Resolution)**
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./cli": {
      "types": "./dist/cli.d.ts",
      "import": "./dist/cli.js"
    }
  }
}
```

**4. Add files Field (Control Published Files)**
```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

**5. Add Repository/Homepage/Bugs**
```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/memehalis/screenie.git"
  },
  "homepage": "https://screenie.xyz",
  "bugs": {
    "url": "https://github.com/memehalis/screenie/issues"
  }
}
```

**6. Update Keywords**
```json
{
  "keywords": [
    "screenshot",
    "responsive",
    "playwright",
    "cli",
    "design",
    "testing",
    "viewport",
    "mobile",
    "desktop",
    "web"
  ]
}
```

**7. Add publishConfig (Optional - For Scoped)**
```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

### Complete Updated package.json

```json
{
  "name": "screenie",
  "version": "2.0.0",
  "description": "Capture responsive screenshots across devices with a single command",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "bin": {
    "screenie": "./dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "dev": "tsx src/cli/index.ts",
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepublishOnly": "npm run build && npm run test",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/memehalis/screenie.git"
  },
  "homepage": "https://screenie.xyz",
  "bugs": {
    "url": "https://github.com/memehalis/screenie/issues"
  },
  "keywords": [
    "screenshot",
    "responsive",
    "playwright",
    "cli",
    "design",
    "testing",
    "viewport",
    "mobile",
    "desktop"
  ],
  "author": "memehalis",
  "license": "MIT",
  "engines": {
    "node": ">=20"
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
    "vitepress": "^1.6.4",
    "vitest": "^2.0.0"
  }
}
```

### Pre-Publish Checklist

Before `npm publish`:

1. **Verify name availability:**
   ```bash
   npm view screenie
   ```

2. **Test package locally:**
   ```bash
   npm pack --dry-run  # See what will be published
   npm pack            # Create tarball
   npm install -g ./screenie-2.0.0.tgz  # Test installation
   ```

3. **Verify shebang in CLI entry:**
   ```javascript
   #!/usr/bin/env node
   // First line of dist/cli.js
   ```

4. **Login to npm:**
   ```bash
   npm login
   npm whoami  # Verify logged in
   ```

5. **Publish:**
   ```bash
   npm publish
   ```

**Confidence:** HIGH - Based on Node.js official documentation and npm best practices

**Sources:**
- [Node.js Packages Documentation](https://nodejs.org/api/packages.html)
- [npm package.json fields](https://docs.npmjs.com/cli/v9/configuring-npm/package-json/)
- [Guide to package.json exports](https://hirok.io/posts/package-json-exports)

---

## Hosting

### Recommendation: Netlify

**Why Netlify over Vercel for this project:**

| Criteria | Netlify | Vercel |
|----------|---------|--------|
| VitePress support | Excellent (official Vite partner) | Good |
| Free tier | More generous | Restricts commercial use |
| Static sites | Purpose-built | Optimized for Next.js |
| Build plugins | Rich ecosystem | Fewer for static |
| Simplicity | Connect git, auto-deploys | Similar |
| Custom domains | Easy setup | Easy setup |

**Deployment Architecture:**

```
screenie.xyz          → Landing page (Netlify)
docs.screenie.xyz     → VitePress docs (Netlify)
```

**Setup for Landing Page:**
```bash
# From landing/ directory
netlify init
# Build command: (none)
# Publish directory: .
```

**Setup for Docs:**
```bash
# From docs/ directory
netlify init
# Build command: npm run docs:build
# Publish directory: docs/.vitepress/dist
```

**Alternative: Single Site with Redirects**

Both landing and docs on one Netlify site:
```
project/
  landing/           # Static HTML
  docs/              # VitePress
  netlify.toml       # Routing config
```

**netlify.toml:**
```toml
[build]
  command = "npm run docs:build"
  publish = "docs/.vitepress/dist"

[[redirects]]
  from = "/"
  to = "/landing/index.html"
  status = 200
```

**Confidence:** MEDIUM-HIGH - Both platforms work well; Netlify slightly better fit for static docs

**Sources:**
- [Netlify Vite Documentation](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- [Northflank Vercel vs Netlify 2026](https://northflank.com/blog/vercel-vs-netlify-choosing-the-deployment-platform-in-2025)
- [Netlify Official Vite Partnership](https://www.netlify.com/blog/vite-plugin-netlify-official-deployment-partner/)

---

## Demo Asset Creation

### Recommendation: VHS (by Charmbracelet)

**Why VHS:**
1. **Scriptable:** Write `.tape` files that define exactly what to type
2. **Reproducible:** Re-render demos without re-recording
3. **High quality:** Better frame rates than alternatives
4. **Multiple formats:** GIF, MP4, WebM output

**Installation (Arch Linux):**
```bash
pacman -S vhs
# VHS requires ttyd and ffmpeg (usually auto-installed as deps)
```

**Create Demo Script (demo.tape):**
```tape
# demo.tape - Screenie demo
Output demo.gif
Output demo.mp4

Set Shell "bash"
Set FontSize 18
Set Width 1200
Set Height 600
Set Theme "Dracula"

Type "screenie https://example.com"
Sleep 500ms
Enter
Sleep 8s

Type "screenie https://example.com --devices iphone-14,pixel-7,desktop"
Sleep 500ms
Enter
Sleep 10s
```

**Generate Demo:**
```bash
vhs demo.tape
# Outputs: demo.gif, demo.mp4
```

**Alternative: asciinema + agg**

For embedding on docs (interactive player):
```bash
# Record
asciinema rec demo.cast

# Convert to GIF
agg demo.cast demo.gif
```

**Recommendation:**
- **Landing page:** Use VHS-generated GIF (auto-plays, no interaction needed)
- **Documentation:** Consider asciinema embeds (users can pause, copy commands)

**Confidence:** HIGH - VHS is the standard for CLI demo GIFs

**Sources:**
- [VHS GitHub](https://github.com/charmbracelet/vhs)
- [asciinema](https://docs.asciinema.org/getting-started/)
- [agg (asciinema gif generator)](https://docs.asciinema.org/manual/agg/)

---

## Stack Summary Table

| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| Landing Page | Vanilla HTML/CSS | N/A | Zero deps, instant load, appropriate for single page |
| Documentation | VitePress | ^1.6.4 | Vite-powered, Vue ecosystem, perfect for tech docs |
| npm Publishing | Standard exports | N/A | Modern package resolution with types |
| Hosting | Netlify | N/A | Official Vite partner, generous free tier, static-focused |
| Demo GIFs | VHS | latest | Scriptable, reproducible, high quality output |

---

## Implementation Order

1. **npm Package Prep** - Update package.json, test local install
2. **Demo Creation** - Record with VHS before launch
3. **Landing Page** - Build with demo GIF embedded
4. **Documentation** - Set up VitePress, write initial docs
5. **Hosting** - Deploy landing to screenie.xyz, docs to docs.screenie.xyz
6. **Publish** - npm publish after everything is live

---

## Open Questions

1. **Package name availability:** Verify `screenie` is available on npm
2. **Domain registration:** Confirm screenie.xyz is available/owned
3. **postinstall script:** Keep `playwright install chromium` or document separately?
4. **Peer dependencies:** Should playwright be a peer dep instead of direct dep?

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| VitePress | HIGH | Official docs, used by major projects |
| npm Publishing | HIGH | Node.js official documentation |
| Hosting (Netlify) | MEDIUM-HIGH | Both platforms viable; Netlify better static fit |
| Landing (vanilla) | HIGH | Standard practice for CLI tools |
| VHS | HIGH | De facto standard for CLI demos |
