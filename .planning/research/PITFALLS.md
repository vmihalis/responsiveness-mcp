# Pitfalls Research

**Project:** Screenie CLI — Open Source Release
**Researched:** 2026-01-20
**Confidence:** HIGH (multiple authoritative sources)

This document catalogs common mistakes when publishing an open source CLI tool to npm, creating documentation, building a landing page, and managing an open source project. Each pitfall includes warning signs, prevention strategies, and which phase should address it.

---

## npm Publishing Pitfalls

| Pitfall | Warning Signs | Prevention | Phase |
|---------|--------------|------------|-------|
| **Secrets exposed in published package** | `.env`, credentials, or API keys accidentally included; `npm pack --dry-run` shows unexpected files | Use `files` field in package.json as whitelist (not `.npmignore`); always run `npm pack --dry-run` before publishing; verify tarball contents | npm setup |
| **Missing or wrong shebang** | CLI works locally via `node`, fails when installed globally; Windows users report errors; CRLF line endings in entry file | Ensure `#!/usr/bin/env node` on first line of CLI entry; use LF line endings only; test on Windows via `cmd-shim` behavior | npm setup |
| **bin path incorrect** | `command not found` after global install; symlinks point to wrong file; works in dev but not when published | Verify `bin` field points to built output (not source); test with `npm link` before publishing; confirm file exists at specified path | npm setup |
| **Version already exists error** | `npm ERR! 403 Forbidden - cannot publish over previously published version` | Use `npm version patch/minor/major` before publish; never manually edit version; use semantic versioning consistently | npm setup |
| **Scoped package defaults to private** | Package publishes but others get `404 Not Found` when installing | Use `--access=public` flag or set `publishConfig.access: "public"` in package.json for scoped packages | npm setup |
| **OIDC token issues in CI** | CI publish fails with `ENEEDAUTH`; "Classic tokens have been revoked" errors | For GitHub Actions, ensure npm 11.5.1+; first version must be published manually; verify `repository.url` matches exactly (case-sensitive) | CI/CD |
| **engines field missing** | Users on older Node versions get cryptic runtime errors instead of clear install warnings | Set `engines: { "node": ">=20" }` matching actual requirements; test on minimum supported version | npm setup |
| **TypeScript source published instead of built output** | Package size bloated; consumers get compilation errors; types don't work properly | Ensure `files` field includes only `dist/`; verify `main`, `types`, and `bin` point to built files; run build before pack/publish | npm setup |
| **peerDependencies too strict** | Users get dependency conflicts; `ERESOLVE unable to resolve dependency tree` | Use wide version ranges like `^1.0` not `1.0.4`; don't lock to specific patch versions | npm setup |
| **prepublishOnly vs prepare confusion** | Build runs at wrong time; published package missing compiled code; installs trigger unexpected builds | Use `prepublishOnly` for build (runs only on `npm publish`); avoid `postinstall` scripts; test full publish cycle locally | npm setup |

### Critical npm Pitfall Deep Dive

#### Secrets in Package (CRITICAL)

**What goes wrong:** The `.gitignore` file excludes secrets from git, but `.npmignore` doesn't exist or differs. Secrets like `.env` files, `credentials.json`, or internal configuration get published to the public npm registry. Once published, the version cannot be fully removed (metadata persists).

**Root cause:** If both `.gitignore` and `.npmignore` exist, npm uses ONLY `.npmignore`. If `.npmignore` is missing, npm falls back to `.gitignore`. Developers update one but not the other.

**Consequences:** API keys leaked publicly; security incident; credential rotation required; reputational damage.

**Prevention:**
1. Use `files` field in package.json as a whitelist (takes precedence over ignore files)
2. Run `npm pack --dry-run` and inspect output before every publish
3. Never have both `.gitignore` and `.npmignore` — prefer `files` field
4. Add secrets to both ignore files if you must use `.npmignore`

**Detection:** Unexpected files in `npm pack` output; package size larger than expected.

Sources: [OWASP npm Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html), [Snyk npm Security Best Practices](https://snyk.io/blog/ten-npm-security-best-practices/)

---

## Documentation Pitfalls

| Pitfall | Warning Signs | Prevention | Phase |
|---------|--------------|------------|-------|
| **Assumes too much prior knowledge** | "How do I run this?" questions; users stuck on basic setup; technical jargon without explanation | Include complete installation commands; explain prerequisites; assume reader is new to the tool | Documentation |
| **Outdated examples** | Examples use old API; copy-paste doesn't work; version mismatch errors | Test all code examples as part of CI; date examples with version; keep examples in sync with releases | Documentation |
| **Missing quick start** | Users bounce after 30 seconds; high GitHub traffic but low installs; "TL;DR?" comments | First example within 10 seconds of reading; show command + output immediately | Documentation |
| **No troubleshooting section** | Same issues reported repeatedly; users give up instead of debugging; support burden high | Document common errors with solutions; include FAQ; address platform-specific issues | Documentation |
| **Poor search/navigation** | Users can't find what they need; duplicate questions; "where is X documented?" | Use static site generator with search (VitePress); logical navigation structure; cross-link related topics | Documentation |
| **VitePress base URL wrong** | 404 errors on GitHub Pages; assets don't load; links broken on deployed site | Set `base` config correctly for deployment path (e.g., `'/screenie/'` for `user.github.io/screenie`); test build locally | Documentation |
| **VitePress cleanUrls without server config** | URLs work in dev but 404 in production; redirect loops | Either disable `cleanUrls` or configure hosting platform to serve `/foo.html` for `/foo` requests | Documentation |
| **Documentation written after development** | Incomplete coverage; missing context; documentation feels like an afterthought | Write docs alongside features; document decisions while context is fresh; README-driven development | Documentation |

### Critical Documentation Pitfall Deep Dive

#### No Quick Start (HIGH IMPACT)

**What goes wrong:** README opens with lengthy background, installation prerequisites, system requirements, and configuration before showing what the tool does. Users leave before seeing value.

**Root cause:** Documentation written from author's perspective (what I built) not user's perspective (what can this do for me).

**Consequences:** Low adoption despite good tool; users choose simpler-looking alternatives; word of mouth suffers.

**Prevention:**
1. First 10 seconds: one-liner description + primary command
2. Show command AND output (users want to see results)
3. Installation comes AFTER the hook
4. "Screenie captures responsive screenshots across 57 devices in 30 seconds" + demo GIF + `npx screenie https://example.com`

**Detection:** High GitHub stars but low npm downloads; bounce rate on README; users asking basic questions.

Sources: [Command Line Interface Guidelines](https://clig.dev/), [Document360 Developer Documentation Mistakes](https://document360.com/blog/developer-documentation-mistakes/)

---

## Landing Page Pitfalls

| Pitfall | Warning Signs | Prevention | Phase |
|---------|--------------|------------|-------|
| **No clear value proposition** | Visitors don't understand what it does; high bounce rate; "what is this?" feedback | First headline explains the problem solved; avoid jargon; show don't tell (demo GIF/video) | Landing page |
| **Salesy/marketing speak** | Developer audience distrusts it; feels like enterprise software; buzzword overload | Direct, technical language; "captures screenshots" not "empowers teams with visual testing solutions" | Landing page |
| **Missing quick demo** | Users can't visualize the tool; have to install to understand; no immediate hook | Demo GIF above the fold; show actual CLI output; animated terminal (asciinema) | Landing page |
| **Cluttered design with navigation** | Users distracted from CTA; lower conversion; feels like full website not landing page | Single-page, no nav menu; one primary CTA (install/docs); minimal distractions | Landing page |
| **Slow load time** | Users leave before content loads; poor mobile experience; SEO penalty | Optimize images; minimal JS; static hosting (Vercel/Netlify); test on throttled connections | Landing page |
| **AI-generated generic copy** | Feels impersonal; lacks authenticity; users sense it's template content | Write copy manually or heavily edit AI output; match project's voice; specific examples | Landing page |
| **No social proof** | Visitors skeptical; no credibility signals; feels unproven | Add GitHub stars badge; curated testimonials (styled, not embeds); "used by X developers" | Landing page |
| **Broken links to docs/GitHub** | Frustration; users can't proceed; looks unprofessional | Test all links; use relative paths where possible; automated link checking in CI | Landing page |

### Critical Landing Page Pitfall Deep Dive

#### Marketing Speak for Developer Audience (HIGH IMPACT)

**What goes wrong:** Landing page reads like enterprise SaaS: "Streamline your workflow", "Boost productivity", "Enterprise-grade solution". Developers immediately distrust it.

**Root cause:** Using B2B marketing templates; not understanding developer audience.

**Consequences:** Credibility destroyed; developers choose tools with authentic communication; tool seen as corporate rather than community.

**Prevention:**
1. Describe what it does, literally: "Captures 57 responsive screenshots in 30 seconds"
2. Show the command: `npx screenie https://mysite.com`
3. Show the output: terminal screenshot or demo GIF
4. Technical details welcome: "Uses Playwright for headless Chrome"
5. Clever > corporate: personality is good, buzzwords are bad

**Detection:** Feedback like "sounds too salesy"; low conversion from landing page to install.

Sources: [Evil Martians Dev Tool Landing Pages Study](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025), [Moosend Landing Page Mistakes](https://moosend.com/blog/landing-page-mistakes/)

---

## Open Source Project Pitfalls

| Pitfall | Warning Signs | Prevention | Phase |
|---------|--------------|------------|-------|
| **No license file** | Project legally unusable; companies can't adopt it; no clear terms for contribution | Add LICENSE file with appropriate license (MIT recommended for max adoption); add to package.json `license` field | npm setup |
| **License choice regret** | Want to change license later but can't (copyleft); contributors distributed copyright | Research licenses before release; MIT for maximum adoption; understand copyleft implications; decision is permanent | npm setup |
| **Missing CONTRIBUTING.md** | Random PRs that don't match project style; unclear how to help; contributors confused | Document contribution process; code style requirements; PR template; issue template | Documentation |
| **No issue/PR templates** | Low-quality bug reports; duplicate issues; PRs missing context | Add GitHub issue templates (bug report, feature request); PR template with checklist | GitHub setup |
| **Typosquatting vulnerability** | Malicious package with similar name; users accidentally install wrong package | Register obvious typo variations; use scoped package (`@screenie/cli`); register your org scope on npm even if not using | npm setup |
| **Ignoring contributor onboarding** | "Good first issue" but no guidance; contributors struggle to set up dev environment | Document dev setup in CONTRIBUTING.md; label beginner-friendly issues; respond quickly to first-time contributors | Documentation |
| **Maintainer burnout** | Delayed responses; growing issue backlog; resentment; considering abandonment | Set expectations clearly (response time); automate where possible; document how to reduce your load; it's OK to say no | Ongoing |
| **Toxic community interactions** | Demanding users; entitlement; public shaming over bugs; burnout | Code of conduct; clear communication about volunteer nature; block toxic users; community guidelines | GitHub setup |
| **Scope creep from feature requests** | Project grows beyond maintainable; every request seems reasonable; losing focus | Clear scope in README; "out of scope" list; politely decline misaligned requests; link to project philosophy | Documentation |
| **Breaking changes in minor/patch** | User builds break; trust eroded; "your update broke my CI" issues | Follow semantic versioning strictly; CHANGELOG.md for all changes; test before release; consider beta releases | npm setup |

### Critical Open Source Pitfall Deep Dive

#### No License File (CRITICAL)

**What goes wrong:** Project is published without a LICENSE file. Despite being "public", no one can legally use, modify, or distribute the code. Companies cannot adopt it. Other projects cannot depend on it.

**Root cause:** Assumption that "public = free to use"; not understanding copyright defaults.

**Consequences:**
- Code is copyrighted by default (all rights reserved)
- Organizations with legal review cannot use it
- Contributors unclear on terms
- Project cannot be forked legally

**Prevention:**
1. Add LICENSE file before first release (MIT recommended for max adoption)
2. Set `license: "MIT"` in package.json
3. Choose license early — cannot easily change once contributors involved
4. If in doubt, MIT is most permissive and widely accepted

**Detection:** "Can we use this?" questions; companies passing on adoption; no SPDX license identifier.

Sources: [Open Source Licensing Guide](https://github.com/readme/guides/open-source-licensing), [Choose a License](https://choosealicense.com/), [npm Docs on License](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#license)

#### Maintainer Burnout (HIGH IMPACT)

**What goes wrong:** 60% of open source maintainers are unpaid. 44% cite burnout as reason for quitting. Kubernetes Ingress NGINX was retired in 2025 due to maintainer burnout despite being critical infrastructure.

**Root cause:** Users treat maintainers like free support; emotional labor is invisible; no boundaries; financial unsustainability.

**Consequences:** Project abandoned; security vulnerabilities unpatched; users left stranded; maintainer health suffers.

**Prevention:**
1. Set clear expectations in README ("responses may take X days")
2. Use issue templates to reduce low-quality reports
3. It's OK to close issues that aren't bugs
4. Document that this is volunteer work
5. Consider GitHub Sponsors if project grows
6. Say no to feature requests outside scope
7. Automate everything possible (CI, releases, stale issue bot)

**Detection:** Growing issue backlog; delayed responses; resentment when working on project; avoiding GitHub notifications.

Sources: [Open Source Maintainer Crisis Report](https://byteiota.com/open-source-maintainer-crisis-60-unpaid-burnout-hits-44/), [Maintaining Balance for OSS Maintainers](https://opensource.guide/maintaining-balance-for-open-source-maintainers/), [Intel Maintainer Burnout](https://www.intel.com/content/www/us/en/developer/articles/community/maintainer-burnout-a-problem-what-are-we-to-do.html)

---

## Phase-Specific Warning Summary

| Phase | Top Pitfalls to Watch | Mitigation |
|-------|----------------------|------------|
| **npm setup** | Secrets in package, missing license, shebang issues, bin path wrong | Use `files` whitelist, `npm pack --dry-run`, LICENSE first, test `npm link` |
| **Documentation** | No quick start, outdated examples, VitePress deployment | Demo in first 10 seconds, test examples in CI, verify base URL config |
| **Landing page** | Marketing speak, no demo, slow load | Direct language, GIF/video above fold, static hosting |
| **GitHub setup** | No templates, no CONTRIBUTING, no CoC | Add all templates before announcement, set expectations early |
| **Ongoing** | Burnout, scope creep, breaking changes | Boundaries, clear scope, semantic versioning |

---

## Pre-Release Checklist (Pitfall Prevention)

Before publishing v2.0:

### npm Package
- [ ] LICENSE file exists with chosen license
- [ ] `license` field in package.json matches LICENSE file
- [ ] `files` field whitelists only intended files (dist/, README, LICENSE)
- [ ] `npm pack --dry-run` shows expected contents only
- [ ] No secrets in package (`.env`, credentials, API keys)
- [ ] `bin` field points to built output with correct shebang
- [ ] `engines` field specifies Node version requirement
- [ ] `repository.url` is correct for npm provenance
- [ ] Scoped package has `publishConfig.access: "public"` if needed
- [ ] Version is 2.0.0 (not 0.x for public release)

### Documentation
- [ ] Quick start visible within 10 seconds of opening README
- [ ] Installation command is copy-pasteable and works
- [ ] All code examples tested and working
- [ ] VitePress `base` config correct for deployment URL
- [ ] Search works in documentation site
- [ ] Troubleshooting/FAQ section exists

### Landing Page
- [ ] Value proposition in first headline (no jargon)
- [ ] Demo GIF/video above the fold
- [ ] All links work (docs, GitHub, npm)
- [ ] Mobile responsive
- [ ] Load time under 3 seconds

### GitHub Repository
- [ ] CONTRIBUTING.md with setup instructions
- [ ] Issue templates (bug report, feature request)
- [ ] PR template
- [ ] Code of conduct
- [ ] Clear scope in README (and out of scope)

---

## Sources

### npm Publishing
- [OWASP npm Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html)
- [Snyk npm Security Best Practices](https://snyk.io/blog/ten-npm-security-best-practices/)
- [npm Docs - package.json](https://docs.npmjs.com/cli/v7/configuring-npm/package-json/)
- [npm Threats and Mitigations](https://docs.npmjs.com/threats-and-mitigations/)
- [npm Publishing Guide](https://dev.to/brense/publishing-a-nodejs-cli-tool-to-npm-5f2m)

### CLI Development
- [Command Line Interface Guidelines](https://clig.dev/)
- [Fuchsia CLI Guidelines](https://fuchsia.dev/fuchsia-src/development/api/cli)
- [npm Shebang Documentation](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#bin)

### Documentation
- [Document360 Documentation Mistakes](https://document360.com/blog/developer-documentation-mistakes/)
- [VitePress Deployment Guide](https://vitepress.dev/guide/deploy)
- [VitePress Getting Started](https://vitepress.dev/guide/getting-started)

### Landing Pages
- [Evil Martians Dev Tool Landing Pages Study](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)
- [Moosend Landing Page Mistakes](https://moosend.com/blog/landing-page-mistakes/)

### Open Source Management
- [Open Source Guides - Maintaining Balance](https://opensource.guide/maintaining-balance-for-open-source-maintainers/)
- [Open Source Guides - Best Practices](https://opensource.guide/best-practices/)
- [Open Source Licensing Guide](https://github.com/readme/guides/open-source-licensing)
- [Open Source Maintainer Crisis Report](https://byteiota.com/open-source-maintainer-crisis-60-unpaid-burnout-hits-44/)
- [CFPB README Refresh Day](https://cfpb.github.io/articles/readme-refresh-day/)

### Security
- [npm Typosquatting Prevention](https://blog.inedo.com/npm/avoid-security-risks-in-npm-packages-with-scoping)
- [Snyk Typosquatting Attacks](https://snyk.io/blog/typosquatting-attacks/)
