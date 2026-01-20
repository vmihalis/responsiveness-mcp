# Architecture Research

**Project:** Screenie CLI - Landing Page & Documentation Site
**Researched:** 2026-01-20
**Overall Confidence:** HIGH

## Repository Structure

### Recommendation: Monorepo with pnpm Workspaces

**Use a single repository** with the existing CLI code alongside new `apps/` directory for web properties.

**Rationale:**
- CLI is small (single TypeScript package) - no need for separate repos
- Landing page and docs benefit from shared assets, copy, and examples
- Documentation can reference CLI source directly for code examples
- Single CI/CD pipeline for npm + web deployments
- Industry standard for open source CLI tools (Turborepo, Astro, Vite all use this pattern)

**Alternatives Considered:**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Monorepo** (recommended) | Single source of truth, atomic changes, shared tooling | Slightly more complex initial setup | Best for this scale |
| Separate repos | Complete isolation | Split documentation, version drift, harder to keep in sync | Overkill for small CLI |
| Docs in same package | Simplest | Pollutes npm package, no clear separation | Not recommended |

### Why NOT Turborepo

For a project this size (1 CLI + 2 web apps), Turborepo adds unnecessary complexity:
- pnpm workspaces alone handle dependency management
- Build caching is minimal benefit with 3 small packages
- Additional configuration overhead

If the project grows significantly (5+ packages), revisit Turborepo adoption.

## Folder Organization

### Recommended Structure

```
screenie/
├── apps/
│   ├── web/                    # Landing page (screenie.xyz)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── styles/
│   │   │   └── assets/
│   │   ├── public/
│   │   ├── astro.config.mjs
│   │   └── package.json
│   │
│   └── docs/                   # Documentation (docs.screenie.xyz)
│       ├── src/
│       │   ├── content/
│       │   │   └── docs/       # Markdown documentation
│       │   └── assets/
│       ├── astro.config.mjs
│       └── package.json
│
├── packages/
│   └── cli/                    # CLI package (moved from root)
│       ├── src/
│       │   ├── cli/
│       │   ├── config/
│       │   ├── devices/
│       │   ├── engine/
│       │   ├── output/
│       │   ├── types/
│       │   └── utils/
│       ├── tests/
│       ├── scripts/
│       ├── package.json        # "name": "@screenie/cli" or "screenie"
│       ├── tsconfig.json
│       └── tsup.config.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # Test + lint on PR
│       ├── release-cli.yml     # npm publish on tag
│       └── deploy-web.yml      # Vercel preview on PR
│
├── package.json                # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json                  # Optional, can add later
└── README.md
```

### Key Decisions

**1. CLI moves to `packages/cli/`**
- Keeps npm-publishable code separate from web apps
- Root becomes workspace orchestrator only
- Package name stays `screenie` or becomes `@screenie/cli`

**2. Landing page in `apps/web/`**
- Follows Turborepo convention (`web` not `landing` or `website`)
- Contains marketing content, hero, features, pricing
- Framework: Astro (see rationale below)

**3. Docs in `apps/docs/`**
- Separate Astro project with Starlight
- Content-focused, can evolve independently
- Markdown in `src/content/docs/`

### Root Configuration Files

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Root package.json:**
```json
{
  "private": true,
  "scripts": {
    "dev": "pnpm -r dev",
    "dev:web": "pnpm --filter @screenie/web dev",
    "dev:docs": "pnpm --filter @screenie/docs dev",
    "dev:cli": "pnpm --filter screenie dev",
    "build": "pnpm -r build",
    "test": "pnpm --filter screenie test",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "pnpm": "^9.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

## Domain Configuration

### Deployment Targets

| Domain | App | Purpose |
|--------|-----|---------|
| screenie.xyz | `apps/web` | Landing page |
| docs.screenie.xyz | `apps/docs` | Documentation |
| npmjs.com/package/screenie | `packages/cli` | npm package |

### Vercel Setup (Recommended)

Create **two Vercel projects** from the same repository:

**Project 1: screenie-web**
- Root directory: `apps/web`
- Domain: screenie.xyz
- Build command: `pnpm build` (or auto-detected)
- Output: `dist/`

**Project 2: screenie-docs**
- Root directory: `apps/docs`
- Domain: docs.screenie.xyz
- Build command: `pnpm build`
- Output: `dist/`

**vercel.json in each app:**
```json
{
  "buildCommand": "cd ../.. && pnpm install && pnpm --filter @screenie/web build",
  "outputDirectory": "dist"
}
```

### DNS Configuration

```
screenie.xyz          A      76.76.21.21 (Vercel)
www.screenie.xyz      CNAME  cname.vercel-dns.com
docs.screenie.xyz     CNAME  cname.vercel-dns.com
```

### Alternative: Netlify

Same approach works with Netlify:
- Create two sites from same repo
- Set base directory per site
- Add custom domains

## Deployment Strategy

### CI/CD Pipeline Overview

```
                    ┌─────────────────┐
                    │   GitHub Push   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ PR/Push │    │   Tag   │    │ PR/Push │
        │ to main │    │  v*.*.* │    │ to main │
        └────┬────┘    └────┬────┘    └────┬────┘
             │              │              │
             ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ Vercel  │    │   npm   │    │ Vercel  │
        │  Web    │    │ publish │    │  Docs   │
        └─────────┘    └─────────┘    └─────────┘
```

### Trigger Conditions

| Trigger | Action | Affected |
|---------|--------|----------|
| Push to `main` | Vercel auto-deploy | web, docs |
| PR opened | Vercel preview deploy | web, docs |
| Tag `v*.*.*` | npm publish | cli |
| PR (any) | CI tests | cli |

### GitHub Actions Workflows

**1. CI (`.github/workflows/ci.yml`):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter screenie test
      - run: pnpm --filter screenie build
```

**2. Release CLI (`.github/workflows/release.yml`):**
```yaml
name: Release CLI
on:
  push:
    tags:
      - 'v*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm --filter screenie build
      - run: pnpm --filter screenie publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**3. Vercel handles web deploys automatically** (no workflow needed)

### Vercel Integration Benefits

- Automatic preview deploys on PRs
- Automatic production deploys on merge to main
- Per-app deployments (only changed app rebuilds)
- Built-in analytics and performance monitoring

## Build Order

### Development Workflow

```bash
# From repository root

# 1. Install all dependencies
pnpm install

# 2. Run everything in parallel
pnpm dev

# Or run individually:
pnpm dev:cli   # CLI development (tsx watch)
pnpm dev:web   # Landing page (Astro dev server)
pnpm dev:docs  # Docs site (Astro dev server)
```

### Production Build Order

No strict order required - builds are independent:

```bash
# All packages build in parallel
pnpm build

# Or sequential for debugging:
pnpm --filter screenie build        # 1. CLI
pnpm --filter @screenie/web build   # 2. Landing page
pnpm --filter @screenie/docs build  # 3. Docs
```

### Release Sequence

1. **Develop** - Feature branches, PR reviews
2. **Merge** - PR merged to main
3. **Web auto-deploys** - Vercel builds web + docs
4. **Tag for CLI** - `git tag v1.2.3 && git push --tags`
5. **npm publish** - GitHub Action publishes to npm

## Technology Recommendations

### Landing Page: Astro

**Why Astro:**
- Zero JavaScript by default (fastest possible landing page)
- Component islands for interactive sections
- Can use React/Vue/Svelte components if needed
- Excellent image optimization
- Native Vercel deployment support

**Alternative considered:** Next.js
- Overkill for a landing page
- Heavier runtime
- More complex for static content

### Documentation: Astro Starlight

**Why Starlight:**
- Built on Astro (consistent tooling)
- Beautiful default theme
- Built-in search (Pagefind)
- i18n support out of the box
- Sidebar auto-generation from file structure
- Used by Cloudflare, OpenAI, Netlify

**Alternative considered:** VitePress
- Vue-based (inconsistent with landing page)
- Requires Vue knowledge for customization
- Starlight has caught up on features

### Shared Assets Pattern

```
packages/
  └── shared/                   # Optional: shared assets
      ├── assets/
      │   ├── logo.svg
      │   └── og-image.png
      └── package.json
```

Apps import from shared:
```typescript
import logo from '@screenie/shared/assets/logo.svg';
```

This is optional for a small project - can also just copy assets.

## Migration Path

### Phase 1: Restructure Repository

1. Create `packages/cli/` directory
2. Move all CLI files into `packages/cli/`
3. Update paths in package.json, tsconfig.json
4. Add root pnpm-workspace.yaml
5. Test CLI still builds and runs

### Phase 2: Add Landing Page

1. Create `apps/web/` with Astro
2. Build landing page content
3. Configure Vercel project for `apps/web`
4. Deploy to screenie.xyz

### Phase 3: Add Documentation

1. Create `apps/docs/` with Astro Starlight
2. Write initial documentation
3. Configure Vercel project for `apps/docs`
4. Deploy to docs.screenie.xyz

### Phase 4: CI/CD

1. Add GitHub Actions for CLI testing
2. Add npm publish workflow
3. Verify Vercel auto-deploys work
4. Test full release cycle

## Anti-Patterns to Avoid

### 1. Single Astro Project for Both

**Don't:** Put landing page and docs in same Astro project with path-based routing.

**Why:** Starlight takes over the entire project. Path hacks (`src/content/docs/docs/`) are fragile and break on upgrades.

### 2. Docs in npm Package

**Don't:** Include documentation site source in the CLI package.

**Why:** Bloats npm package size. Users installing `screenie` get Astro dependencies.

### 3. Separate Repositories

**Don't:** Create screenie-docs or screenie-web repos.

**Why:** Version drift, harder to keep examples in sync with CLI, more repos to maintain.

### 4. Overly Complex Tooling

**Don't:** Add Turborepo, Nx, or Lerna for 3 packages.

**Why:** pnpm workspaces handle this scale perfectly. Add complexity only when needed.

## Sources

### Primary Sources (HIGH Confidence)
- [Turborepo: Structuring a Repository](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository)
- [Vercel: Using Monorepos](https://vercel.com/docs/monorepos)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Astro Starlight](https://starlight.astro.build/)
- [Astro: Deploy to Vercel](https://docs.astro.build/en/guides/deploy/vercel/)

### Community Patterns (MEDIUM Confidence)
- [Corsfix: Multiple Astro Projects One Domain](https://corsfix.com/blog/multiple-astro-projects-one-domain)
- [Starlight Subdomain Discussion](https://github.com/withastro/starlight/discussions/1560)
- [Deploy Monorepo to Subdomains on Vercel](https://dev.to/jdtjenkins/how-to-deploy-a-monorepo-to-different-subdomains-on-vercel-2chn)

### Ecosystem Research (MEDIUM Confidence)
- [monorepo.tools](https://monorepo.tools/)
- [Feature-Sliced Design: Monorepo Guide](https://feature-sliced.design/blog/frontend-monorepo-explained)
- [VitePress vs Astro Starlight Comparison](https://dev.to/kevinbism/coding-the-perfect-documentation-deciding-between-vitepress-and-astro-starlight-2i11)
