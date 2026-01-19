# Features Research

## Table Stakes

These are must-have features that users expect. Without these, the tool will be rejected immediately.

### Core Screenshot Functionality
- **Full-page screenshot capture** - Capture entire scrollable pages, not just viewport. Every competitor (pageres-cli, snaprocket, Playwright) supports this.
- **Multiple viewport/resolution support** - Must support capturing at multiple screen sizes in one run. Users expect at minimum: mobile (375px), tablet (768px), desktop (1280px+).
- **Parallel execution** - Capturing 50+ screenshots sequentially is unacceptably slow. pageres-cli generates 100 screenshots from 10 sites in ~1 minute through parallelization.
- **Configurable output directory** - Users need control over where screenshots are saved.
- **Clear, predictable file naming** - Screenshots must have names that indicate URL/path + viewport size. Example: `homepage-1280x800.png`

### Device Presets
- **Pre-built device profiles** - Common device dimensions out of the box (iPhone, iPad, Android phones, common desktop resolutions). Responsively App ships with 30+ built-in profiles. Apify's tool advertises 30+ device presets.
- **Custom viewport dimensions** - Allow user-defined widths/heights beyond presets.

### CLI Usability
- **URL input** - Accept base URL as required parameter.
- **Path specification** - Accept multiple page paths to capture.
- **Simple installation** - npm/yarn/pnpm global install. No complex setup.
- **Clear error messages** - When pages fail to load or screenshots fail, provide actionable errors.

### Output Quality
- **PNG format support** - Industry standard for screenshot quality.
- **Consistent rendering** - Same page should produce identical screenshots across runs (deterministic).

---

## Differentiators

These features provide competitive advantage but are not strictly required for MVP. Prioritize based on user feedback.

### Enhanced Output & Reporting
- **HTML report generation** - Interactive report showing all screenshots organized by device category. cypress-image-diff-html-report demonstrates demand for visual reports. This is your stated differentiator.
- **Folder organization by device category** - phones/tablets/desktops folders. Makes reviewing 50+ screenshots manageable.
- **Thumbnail gallery** - Quick visual overview before diving into full-size images.
- **Side-by-side comparison view** - Compare same page across different viewports.

### Advanced Capture Options
- **Delay/wait configuration** - Wait for JavaScript to render, animations to complete, or specific network idle state. pageres-cli has `--delay` flag.
- **Element hiding** - Hide cookie banners, chat widgets, ads before capture. pageres-cli: `--hide <selector>`. High user demand feature.
- **Cookie banner blocking** - Auto-dismiss consent dialogs. Apify tool advertises this specifically.
- **Dark mode capture** - Emulate `prefers-color-scheme: dark`. pageres-cli: `--darkMode`.
- **Custom CSS injection** - Apply CSS before capture for testing or hiding elements. pageres-cli: `--css`.
- **Specific element capture** - Capture only a DOM element, not full page. pageres-cli: `--selector`.

### Authentication & Headers
- **Cookie support** - Pass authentication cookies. pageres-cli: `--cookie`.
- **Custom HTTP headers** - Authorization headers, custom user agents. pageres-cli: `--header`, `--user-agent`.
- **Basic auth** - Username/password for HTTP authentication. pageres-cli: `--username`, `--password`.

### Developer Experience
- **Configuration file support** - `.responsiveness.config.js` or similar for project-level defaults.
- **Verbose/debug mode** - Detailed output for troubleshooting failed captures.
- **Dry-run mode** - Preview what would be captured without actually running.
- **Progress indicators** - Show capture progress for long-running batches.

### Image Options
- **JPEG format support** - Smaller file sizes when quality is less critical.
- **Image scaling** - Capture at 2x for retina displays. pageres-cli: `--scale`.
- **Transparent background** - For design asset generation. pageres-cli: `--transparent`.
- **Image cropping** - Crop to specific height. pageres-cli: `--crop`.

### Batch & Automation
- **Sitemap parsing** - Auto-discover pages from sitemap.xml.
- **URL list from file** - Read URLs from text file for batch processing.
- **Retry failed captures** - Automatically retry on transient failures.
- **Overwrite vs append** - Control behavior when output files exist. pageres-cli: `--overwrite`.

---

## Anti-Features

Things to deliberately NOT build, with reasoning.

### Visual Regression / Diff Comparison
**DO NOT BUILD**: Baseline storage, pixel-by-pixel comparison, visual diff highlighting.

**Why**: This is a completely different product category dominated by Percy, Applitools, Playwright snapshots, and BackstopJS. These tools have years of investment in:
- AI-powered comparison algorithms (reduce false positives)
- Baseline management systems
- CI/CD integration for automated approval workflows
- Dynamic content handling

Building this would be:
1. Massive scope creep
2. Competing with well-funded, mature products
3. Different user workflow (CI/CD integrated vs one-off review)

**What to build instead**: Capture screenshots, organize them, generate HTML report. Let users visually review manually or pipe output to existing diff tools if needed.

### Real Device / Cloud Browser Testing
**DO NOT BUILD**: Running on actual physical devices, cloud browser farm integration.

**Why**: This is BrowserStack/LambdaTest territory requiring:
- Device farm infrastructure ($$$)
- Cross-platform browser management
- Significant ops overhead

Our tool uses headless Chromium/Puppeteer. That's sufficient for responsive layout verification.

### Interactive Browser / DevTools
**DO NOT BUILD**: Mirrored interactions, synchronized scrolling, live CSS editing, element inspector.

**Why**: This is Responsively App's domain (and they do it well, open source). It's a different use case - interactive development vs batch capture for review.

### SaaS / Cloud Service
**DO NOT BUILD**: Cloud-hosted version, user accounts, screenshot storage, team collaboration.

**Why**: Keeps tool simple, no infrastructure costs, no auth/billing complexity. CLI that runs locally is the scope.

### GUI / Electron App
**DO NOT BUILD**: Desktop application with graphical interface.

**Why**: CLI tools are simpler to maintain, easier to automate, and integrate better with development workflows. Responsively App already fills the GUI niche.

### PDF/Video Export
**DO NOT BUILD**: PDF reports, video recording of pages.

**Why**: Scope creep. Focus on screenshots + HTML report.

### AI-Powered Analysis
**DO NOT BUILD**: AI detection of visual issues, automated suggestions.

**Why**: This is Applitools' moat with years of ML investment. We're building a capture tool, not an analysis platform.

---

## Feature Dependencies

Understanding which features unlock or require others helps prioritize development.

```
Core Screenshot Capture
    |
    +-- Multiple Viewports (requires: parallel execution for speed)
    |       |
    |       +-- Device Presets (enhances: viewport config)
    |       |
    |       +-- Folder Organization (requires: multiple viewports)
    |               |
    |               +-- HTML Report (requires: organized folder structure)
    |                       |
    |                       +-- Thumbnail Gallery (enhances: HTML report)
    |                       |
    |                       +-- Side-by-side View (enhances: HTML report)
    |
    +-- Wait/Delay Options (standalone, high value)
    |
    +-- Element Hiding (standalone, high value)
    |       |
    |       +-- Cookie Banner Blocking (specialized form of element hiding)
    |
    +-- Authentication (cookie, headers, basic auth - group together)
    |
    +-- Config File (requires: multiple options to configure)
```

### Recommended Build Order (MVP to Full)

**Phase 1 - MVP**:
1. Single URL + paths capture
2. Multiple viewport dimensions
3. Full-page screenshots
4. Parallel execution
5. Organized folder output (phones/tablets/desktops)
6. Basic HTML report

**Phase 2 - Polish**:
7. Device presets
8. Wait/delay configuration
9. Element hiding
10. Progress indicators

**Phase 3 - Power Features**:
11. Cookie/header support
12. Config file
13. Dark mode
14. Custom CSS injection
15. Batch URL input from file

---

## Competitive Landscape Summary

| Tool | Type | Strengths | Gap We Fill |
|------|------|-----------|-------------|
| pageres-cli | CLI | Fast, flexible, mature | No organized output, no HTML report |
| snaprocket | CLI | Simple, Puppeteer-based | Minimal features, small user base |
| Percy | SaaS | Visual regression, CI integration | Requires subscription, overkill for quick review |
| Applitools | SaaS | AI-powered comparison | Enterprise pricing, complex setup |
| Responsively | Desktop | Interactive dev browser | Not for batch capture |
| Chrome DevTools | Built-in | Free, always available | Manual, one viewport at a time |

**Our Positioning**: Fast CLI tool for batch responsive screenshot capture with organized output and HTML report. Not a regression testing platform, not an interactive browser - a review preparation tool.
