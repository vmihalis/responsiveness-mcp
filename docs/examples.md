# Examples

Real-world usage examples for common scenarios.

## Basic Capture

Capture all device viewports for a website:

```bash
npx screenie-tool https://example.com
```

**Output:** 57 screenshots in `./screenshots/` + HTML report

## Full-Page Capture

Capture the entire page height instead of just the viewport:

```bash
npx screenie-tool https://example.com --full-page
```

**Output:** 57 full-page screenshots showing all content

**Use case:** Documenting complete page layouts, testing scroll content

## Full-Page with Multiple Pages

Combine full-page with multiple page paths:

```bash
npx screenie-tool https://example.com --full-page --pages /home /about /pricing
```

**Output:** Complete page captures for all specified routes

## Capture Specific Page

Capture a specific page path:

```bash
npx screenie-tool https://example.com /about
```

**Output:** Screenshots of `https://example.com/about` across all devices

## Multiple Pages

Capture multiple pages in one command:

```bash
npx screenie-tool https://example.com --pages /home /about /contact /pricing
```

**Output:** 57 screenshots × 4 pages = 228 total screenshots

More efficient than running screenie 4 separate times.

## Phone Viewports Only

Test mobile-specific layouts without capturing tablets or desktops:

```bash
npx screenie-tool https://example.com --phones-only
```

**Output:** 24 phone screenshots (faster capture)

**Use case:** Quick mobile layout verification during development

## Tablet Viewports Only

Test tablet-specific layouts:

```bash
npx screenie-tool https://example.com --tablets-only
```

**Output:** 16 tablet screenshots

**Use case:** iPad-specific layout testing

## Desktop Viewports Only

Test desktop-specific layouts:

```bash
npx screenie-tool https://example.com --desktops-only
```

**Output:** 17 desktop screenshots

**Use case:** Large screen layout verification

## Custom Output Directory

Save screenshots to a specific location:

```bash
npx screenie-tool https://example.com --output ./build/screenshots
```

**Output:** Screenshots saved to `./build/screenshots/` instead of default `./screenshots/`

**Use case:** Integration with build systems or CI pipelines

## CI Mode (No Browser)

Run in CI environment without opening the report:

```bash
npx screenie-tool https://example.com --no-open
```

**Output:** Screenshots and report generated, but browser doesn't open

**Use case:** GitHub Actions, GitLab CI, Jenkins, etc.

## Local Development Server

Capture screenshots from a local development server:

```bash
# Start your dev server first
npm run dev

# In another terminal
npx screenie-tool http://localhost:3000
```

**Use case:** Testing during development

## Custom Concurrency

Control parallelism for faster or more conservative capture:

```bash
# Fast capture (high CPU usage)
npx screenie-tool https://example.com --concurrency 10

# Conservative capture (low CPU usage)
npx screenie-tool https://example.com --concurrency 2
```

**Use case:** Balance speed vs. system resources

## Wait for Content

Add wait time for animations or lazy-loaded content:

```bash
npx screenie-tool https://example.com --wait 1000
```

**Output:** Wait 1 second after page load before capturing

**Use case:** Hero animations, lazy-loaded images, dynamic content

## Combining Options

Combine multiple options for complex scenarios:

```bash
npx screenie-tool http://localhost:3000 \
  --pages /home /products /about \
  --phones-only \
  --concurrency 5 \
  --wait 500 \
  --output ./qa-screenshots \
  --no-open
```

**This command:**
- Captures 3 pages (`/home`, `/products`, `/about`)
- Only phone viewports (24 devices)
- 5 parallel captures
- Waits 500ms after page load
- Saves to `./qa-screenshots/`
- Doesn't open browser (CI mode)

Add `--full-page` for entire page capture instead of viewport-only.

**Use case:** Automated QA pipeline for mobile layouts

## Staging Environment

Test staging environment before production deploy:

```bash
npx screenie-tool https://staging.myapp.com --pages / /features /pricing
```

**Use case:** Pre-deployment verification

## Component Testing

Test specific components or pages:

```bash
npx screenie-tool http://localhost:6006 --pages /button /form /modal
```

**Use case:** Testing Storybook components across viewports

## Responsive Breakpoint Verification

Verify all breakpoints in your responsive design:

```bash
npx screenie-tool https://example.com
```

**Output:** 57 viewports covering:
- Mobile: 320px - 428px wide
- Tablet: 768px - 1024px wide
- Desktop: 1280px - 3840px wide

**Use case:** Comprehensive responsive design QA

## API Documentation Site

Test documentation site responsiveness:

```bash
npx screenie-tool https://docs.myapi.com --pages / /quickstart /api-reference /examples
```

**Use case:** Verify documentation is readable on all devices

## E-commerce Product Pages

Test product pages across devices:

```bash
npx screenie-tool https://shop.example.com --pages /products/123 /products/456 /cart /checkout
```

**Use case:** Verify product images, descriptions, and checkout flow on all viewports
