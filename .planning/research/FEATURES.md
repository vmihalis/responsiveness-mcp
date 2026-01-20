# Features Research

**Domain:** Open Source CLI Tool Release
**Project:** Screenie (responsiveness-mcp) - Responsive Screenshot CLI
**Researched:** 2026-01-20
**Confidence:** HIGH (multiple authoritative sources)

---

## Landing Page Features

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear value proposition | Users need to understand "what is this" within 5 seconds | Low | One sentence: "Capture responsive screenshots from your terminal" |
| Installation command | Copy-paste installation is expected for CLI tools | Low | `npm install -g responsiveness-mcp` front and center |
| Quick demo/example | Shows tool in action, builds confidence | Medium | Terminal recording (GIF/asciinema) showing basic usage |
| Feature list | Users scan for capability matches | Low | Bullet points with icons |
| GitHub link | Open source credibility signal | Low | Prominent button/badge |
| License visibility | OSS users need to know terms | Low | MIT badge |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Live demo | Try before install builds massive trust | High | Consider embedding a web playground or CodeSandbox |
| Comparison table | Shows advantage over alternatives (Playwright raw, shot-scraper, etc.) | Medium | Honest comparison highlighting unique multi-viewport feature |
| Output gallery | Visual proof of quality screenshots | Low | Grid of sample outputs at different viewports |
| Integration logos | Shows ecosystem compatibility (CI/CD, GitHub Actions) | Low | Badges for Node, GitHub Actions, etc. |
| Testimonials/stars | Social proof from real users | Medium | Requires adoption first; add GitHub star count badge |
| Performance stats | "Generate 5 screenshots in 3 seconds" type claims | Low | Only if verifiable |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-playing video with sound | Annoying, unprofessional | Use muted GIFs or opt-in video |
| Newsletter popup | Interrupts evaluation | Add newsletter option in footer only |
| Feature overload | Overwhelms users, dilutes message | Focus on 3-5 key features prominently |
| Marketing fluff | Developers distrust vague claims | Use concrete examples and numbers |
| Pricing/enterprise section | Confuses OSS positioning | Keep purely OSS, no commercial tier messaging |
| Animation overload | Slow loading, distracting | Subtle animations only |

---

## Documentation Features

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Installation guide | Every user's first step | Low | Multiple methods: npm global, npx, local install |
| Quick start example | 30-second path to first success | Low | Single command that produces output |
| CLI reference | All commands and flags documented | Medium | `--help` output formatted nicely |
| Configuration options | Users need to customize behavior | Medium | Environment variables, config file format |
| Error troubleshooting | Common issues and solutions | Medium | "Playwright not found", permissions, etc. |
| Changelog | Track what changed between versions | Low | Keep-a-changelog format |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Recipes/cookbook | Real-world usage patterns | Medium | "Screenshot your Storybook", "CI/CD integration" |
| Architecture docs | Helps contributors understand codebase | Medium | Shows professional maintenance |
| Video tutorials | Accessibility for visual learners | High | Short (<3 min) focused tutorials |
| Versioned docs | Different docs per major version | High | Overkill for v1, plan for v2+ |
| Search functionality | Large doc sites need search | Medium | Algolia DocSearch (free for OSS) |
| Dark mode | Developer preference | Low | Essential if building custom site |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Outdated examples | Breaks trust when code doesn't work | Test examples in CI, use actual tool output |
| Missing CLI reference | Forces users to `--help` guess | Generate from source or maintain manually |
| Walls of text | Developers skim, don't read | Use code blocks, tables, bullet points |
| Undocumented flags | Frustrates power users | Document everything, mark experimental flags |
| No error documentation | Users get stuck | Add troubleshooting section |
| Scattered information | Can't find what you need | Clear navigation, table of contents |

---

## npm Package Features

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Semantic versioning | Industry standard, enables dependency management | Low | Already at 1.0.0 |
| Accurate `description` | npm search discoverability | Low | Current: "CLI tool for capturing responsive design screenshots" - good |
| Relevant `keywords` | npm search ranking | Low | Current has 6 keywords - add more: "viewport", "multi-device", "capture" |
| `repository` field | Links npm to GitHub | Low | **Currently missing** - add GitHub URL |
| `bugs` field | Direct path to report issues | Low | **Currently missing** - add issues URL |
| `homepage` field | Links to docs/landing page | Low | **Currently missing** - add URL |
| `license` field | Legal clarity | Low | Already "MIT" |
| `engines` field | Node version requirements | Low | Already ">=20" |
| Clean `files` array | Only ship what's needed | Low | Use `files` field to whitelist dist/ |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| TypeScript declarations | DX for TS users if used as library | Medium | Ship `.d.ts` files |
| `exports` field | Modern ESM support | Low | Define entry points explicitly |
| Minimal dependencies | Faster install, smaller attack surface | Low | Current deps are reasonable |
| Pre-publish checks | Prevents broken releases | Low | `prepublishOnly` script |
| npm provenance | Supply chain security badge | Low | `npm publish --provenance` |
| `funding` field | Sustainability signal | Low | GitHub Sponsors, Open Collective |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Publishing tests | Bloats package size | Use `files` field to exclude |
| Publishing source maps | Usually unnecessary for CLI | Exclude unless debugging needed |
| Missing `bin` field | CLI won't be executable | Already have this |
| Overly broad keywords | Spam signal, poor discovery | Keep keywords focused and relevant |
| No `prepublishOnly` script | Risk publishing broken code | Add build + test before publish |
| Secrets in published package | Security vulnerability | Use `.npmignore` or `files` whitelist |

---

## README Features

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Project name + one-liner | Immediate understanding | Low | "responsiveness-mcp: Responsive screenshots from the CLI" |
| Badges row | Version, license, build status, npm downloads | Low | 4-7 badges max |
| Installation section | `npm install` command | Low | Global and npx options |
| Quick usage example | 5-10 lines showing basic use | Low | Include expected output |
| Feature list | Scannable capabilities | Low | Bullet points with brief descriptions |
| License section | Legal notice | Low | "MIT License" with link |
| API/CLI reference | All options documented | Medium | Or link to full docs |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Demo GIF/video | Visual proof of functionality | Medium | Terminal recording showing command -> output |
| Table of contents | Navigation for long READMEs | Low | Auto-generate with tools |
| Comparison section | Why choose this over alternatives | Medium | Honest comparison table |
| Use cases section | Helps users see if it fits their needs | Low | "Perfect for: design QA, documentation, portfolio shots" |
| Contributing section | Encourages community | Low | Link to CONTRIBUTING.md |
| Acknowledgments | Credits to dependencies/inspirations | Low | Shows good community citizenship |
| Roadmap | Shows project is active/planned | Low | Link to GitHub Projects or brief list |

---

## Supporting Files

### Table Stakes

| File | Purpose | Notes |
|------|---------|-------|
| `LICENSE` | Legal terms | MIT full text file |
| `CHANGELOG.md` | Version history | Keep-a-changelog format |
| `.gitignore` | Clean repo | Standard Node ignores |
| `.npmignore` or `files` | Clean package | Prefer `files` in package.json |

### Differentiators

| File | Purpose | Notes |
|------|---------|-------|
| `CONTRIBUTING.md` | Contributor guidelines | Setup, testing, PR process |
| `CODE_OF_CONDUCT.md` | Community standards | Contributor Covenant recommended |
| `SECURITY.md` | Vulnerability reporting | GitHub recognizes this |
| `.github/ISSUE_TEMPLATE/` | Structured bug reports | Bug report, feature request templates |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR guidelines | Checklist for contributors |
| `.github/FUNDING.yml` | Sponsorship links | GitHub Sponsors integration |

---

## Priority Recommendations

### Must Have for Credibility (Do First)

1. **package.json metadata**: Add `repository`, `bugs`, `homepage` fields
2. **README badges**: npm version, license, build status, downloads
3. **Demo GIF**: Terminal recording of basic usage
4. **CHANGELOG.md**: Document existing versions
5. **LICENSE file**: Full MIT text

### Should Have for Professional Polish

1. **CONTRIBUTING.md**: How to contribute
2. **GitHub issue templates**: Bug report, feature request
3. **Quick start in README**: 3-step path to first screenshot
4. **CLI reference**: All flags documented

### Nice to Have for Excellence

1. **Landing page**: Simple single-page site
2. **Comparison table**: vs shot-scraper, vs raw Playwright
3. **Recipes section**: CI/CD, Storybook, common patterns
4. **CODE_OF_CONDUCT.md**: Community guidelines

---

## Sources

### HIGH Confidence (Authoritative)
- [Command Line Interface Guidelines](https://clig.dev/) - Comprehensive CLI design best practices
- [npm package.json documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/) - Official npm metadata reference
- [Make a README](https://www.makeareadme.com/) - README structure best practices

### MEDIUM Confidence (Verified with multiple sources)
- [Evil Martians Dev Tool Landing Page Research](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025) - Analysis of 100+ landing pages
- [shot-scraper GitHub](https://github.com/simonw/shot-scraper) - Example of well-documented screenshot CLI
- [GitHub README Template Guide](https://rivereditor.com/blogs/write-perfect-readme-github-repo) - README structure analysis
- [Snyk npm package best practices](https://snyk.io/blog/best-practices-create-modern-npm-package/) - Security-focused package guidelines

### LOW Confidence (Single source, verify)
- [Lapa Ninja Open Source Examples](https://www.lapa.ninja/category/open-source/) - Landing page inspiration gallery
