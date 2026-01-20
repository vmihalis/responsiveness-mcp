# Roadmap: Screenie

## Milestones

- [x] **v1.0 MVP** - Phases 1-10 (shipped 2026-01-20)
- [ ] **v2.0 Open Source Release** - Phases 11-16 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-10) - SHIPPED 2026-01-20</summary>

See `.planning/milestones/v1.0-cli/` for complete history.

</details>

### v2.0 Open Source Release (In Progress)

**Milestone Goal:** Package screenie for public release with npm publishing, landing page, and documentation.

**Phase Numbering:**
- Integer phases (11, 12, 13...): Planned milestone work
- Decimal phases (12.1, 12.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 11: npm Package Prep** - Configure package.json for publishing
- [x] **Phase 12: Demo Creation** - Record CLI demo GIF with VHS
- [x] **Phase 13: README Polish** - Update README with demo, badges, features
- [x] **Phase 14: Landing Page** - Build and deploy landing page (Vercel)
- [ ] **Phase 15: Documentation** - Set up VitePress docs.screenie.xyz
- [ ] **Phase 16: Publish** - npm publish with provenance signing

## Phase Details

### Phase 11: npm Package Prep
**Goal**: Package is ready for npm publishing with proper metadata and security
**Depends on**: Nothing (first v2.0 phase)
**Requirements**: NPM-01, NPM-02, NPM-03, NPM-04, NPM-05
**Success Criteria** (what must be TRUE):
  1. `npm pack --dry-run` shows only intended files (no .env, no .planning, no source maps)
  2. `npm link && screenie --help` works from any directory
  3. LICENSE file is MIT and matches package.json license field
  4. package.json has repository, bugs, homepage pointing to correct URLs
**Plans**: 2 plans

Plans:
- [x] 11-01-PLAN.md — Configure package.json and create LICENSE for npm publishing
- [x] 11-02-PLAN.md — Fix CLI branding (gap closure: responsive-capture -> screenie)

### Phase 12: Demo Creation
**Goal**: High-quality demo GIF shows screenie capturing screenshots and generating report
**Depends on**: Phase 11 (need working `screenie` command)
**Requirements**: DEMO-01
**Success Criteria** (what must be TRUE):
  1. Demo GIF shows full workflow: command input, progress output, report opening
  2. GIF is under 5MB for fast loading on landing page and README
  3. Demo captures real website, not placeholder
**Plans**: 1 plan

Plans:
- [x] 12-01-PLAN.md — Create VHS tape script and generate optimized demo GIF

### Phase 13: README Polish
**Goal**: README communicates value and enables instant onboarding
**Depends on**: Phase 12 (need demo GIF)
**Requirements**: README-01, README-02, README-03, README-04
**Success Criteria** (what must be TRUE):
  1. Demo GIF displays at top of README and auto-plays on GitHub
  2. `npx screenie --help` command is copy-pasteable from README
  3. npm version badge updates automatically on new releases
  4. Feature list covers all major capabilities (viewports, report, presets)
**Plans**: 1 plan

Plans:
- [x] 13-01-PLAN.md — Create README with badges, demo GIF, quick start, and features

### Phase 14: Landing Page
**Goal**: Landing page converts visitors to users within 10 seconds
**Depends on**: Phase 12 (need demo GIF)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05
**Success Criteria** (what must be TRUE):
  1. Page loads under 1 second (Lighthouse performance > 95)
  2. Install command copies to clipboard with single click
  3. Demo GIF plays automatically above the fold
  4. Landing page deployed and accessible via Vercel
**Plans**: 2 plans

Plans:
- [x] 14-01-PLAN.md — Create landing page with assets and deployment config
- [x] 14-02-PLAN.md — Deploy to Vercel (custom domain deferred)

### Phase 15: Documentation
**Goal**: Developers can find answers to CLI questions without reading source
**Depends on**: Phase 11 (need accurate CLI reference from package)
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04
**Success Criteria** (what must be TRUE):
  1. VitePress site builds without errors
  2. Getting started guide has copy-pasteable commands that work
  3. CLI reference documents all flags shown in `screenie --help`
  4. docs.screenie.xyz resolves and serves documentation via Netlify
**Plans**: TBD

Plans:
- [ ] 15-01: TBD

### Phase 16: Publish
**Goal**: Package is live on npm and discoverable via search
**Depends on**: Phases 11, 13, 14, 15 (all must be complete before publishing)
**Requirements**: NPM-06, NPM-07
**Success Criteria** (what must be TRUE):
  1. `npm info screenie` returns package metadata
  2. npm package has provenance badge (signed by GitHub Actions)
  3. `npx screenie --help` works for new users without prior installation
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13 -> 14 -> 15 -> 16
(Note: Phases 13, 14, 15 can execute in parallel after 12 completes)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 11. npm Package Prep | 2/2 | ✓ Complete | 2026-01-20 |
| 12. Demo Creation | 1/1 | ✓ Complete | 2026-01-20 |
| 13. README Polish | 1/1 | ✓ Complete | 2026-01-20 |
| 14. Landing Page | 2/2 | ✓ Complete | 2026-01-20 |
| 15. Documentation | 0/? | Not started | - |
| 16. Publish | 0/? | Not started | - |

---

*Created: 2026-01-20*
*Last updated: 2026-01-20 after Phase 14 planning*
