# Phase 17: Fold Line Indicator - Research

**Researched:** 2026-01-21
**Domain:** CSS overlay positioning for scaled images
**Confidence:** HIGH

## Summary

This phase implements a visual fold line indicator showing where the viewport boundary falls on each screenshot. The fold line must appear on both thumbnails (when visible within the cropped view) and the enlarged lightbox view. The key technical challenge is correctly positioning a CSS-based overlay on images that are scaled and cropped differently in thumbnails vs lightbox.

The current HTML report uses:
- **Thumbnails:** `object-fit: cover` with `object-position: top` in a fixed `aspect-ratio: 16/10` container
- **Lightbox:** `object-fit: contain` with `max-width: 95vw` and `max-height: 85vh`
- **Screenshots:** Full-page captures (entire scrollable content, not just viewport)

The fold position is `device.height` pixels from the top of the full-page screenshot. To display the fold line correctly, we need to calculate its position as a percentage of the full screenshot height, then apply that percentage to the displayed image container.

**Primary recommendation:** Use CSS `::after` pseudo-elements with `position: absolute` and `top` set as a percentage (`viewportHeight / screenshotHeight * 100%`). This requires knowing the actual screenshot dimensions at report generation time.

## Standard Stack

### Core (No External Dependencies Needed)

| Component | Approach | Purpose | Why This Approach |
|-----------|----------|---------|-------------------|
| Fold line element | CSS `::after` pseudo-element | Overlay line without extra HTML | Clean, semantic, doesn't affect DOM structure |
| Positioning | `position: absolute` with percentage `top` | Scale-independent positioning | Works with any container size |
| Line styling | `border-top: 2px dashed` with `rgba()` | Non-intrusive dashed line | Meets FOLD-04 requirement for dashed, semi-transparent |
| Container | `position: relative` wrapper | Positioning context | Required for absolute child positioning |

### Supporting Patterns

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| CSS Custom Properties | Pass fold position as `--fold-position` | Per-screenshot dynamic positioning |
| Data attributes | Store fold percentage in `data-fold-percent` | Alternative to CSS custom properties |
| Inline styles | Set `style="--fold-position: X%"` | Simplest for generated HTML |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `::after` | Extra `<div>` element | More HTML, harder to maintain |
| Percentage `top` | Pixel values | Breaks on resize, not responsive |
| CSS custom properties | Inline `top` style | Less semantic, harder to style globally |
| Dashed border | SVG line | Overkill, adds complexity |

**No additional installation required** - uses only CSS already available in the report.

## Architecture Patterns

### Recommended Changes to Reporter

```
src/output/
  reporter.ts          # Modify to include fold line styling and data
  types.ts             # Add screenshotHeight to ScreenshotForReport
```

### Pattern 1: CSS Custom Properties for Dynamic Positioning

**What:** Use `--fold-position` CSS custom property to set fold position per screenshot
**When to use:** For both thumbnails and lightbox elements
**Example:**
```css
/* Global fold line styles */
.thumbnail-link::after,
.lightbox-image-container::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: var(--fold-position, 100%); /* Default off-screen if not set */
  height: 0;
  border-top: 2px dashed rgba(255, 100, 100, 0.6);
  pointer-events: none;
  z-index: 10;
}
```

```html
<!-- Thumbnail with fold position -->
<a href="#lb-iphone-15-pro-393x852"
   class="thumbnail-link"
   style="--fold-position: 28.4%;">
  <img src="data:image/png;base64,..." alt="iPhone 15 Pro">
</a>
```

### Pattern 2: Calculating Fold Position Percentage

**What:** Calculate fold as percentage of full screenshot height
**When to use:** During report generation, for each screenshot
**Example:**
```typescript
// Calculate fold position as percentage
function calculateFoldPercent(
  viewportHeight: number,
  screenshotHeight: number
): number {
  // Fold is at viewportHeight pixels from top
  // Express as percentage of total screenshot height
  return (viewportHeight / screenshotHeight) * 100;
}

// Example: viewport 852px, full-page screenshot 3000px
// Fold at: 852 / 3000 * 100 = 28.4%
```

### Pattern 3: Getting Screenshot Dimensions

**What:** Determine actual screenshot height (not viewport height)
**When to use:** After capturing screenshot, before report generation
**Options:**
1. **Decode PNG header** - Read dimensions from PNG buffer (fastest)
2. **Use image library** - `sharp` or similar (adds dependency)
3. **Store during capture** - Return dimensions from capturer (cleanest)

**Recommended:** Store dimensions during capture or decode PNG header.

```typescript
// PNG header parsing (no dependencies)
function getPngDimensions(buffer: Buffer): { width: number; height: number } {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A (8 bytes)
  // IHDR chunk: length (4) + type (4) + width (4) + height (4)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}
```

### Pattern 4: Handling Thumbnail Cropping

**What:** Account for `object-fit: cover` cropping in thumbnails
**When to use:** When fold line would appear outside visible area
**Insight:** With `object-fit: cover` and `object-position: top`, the thumbnail shows only the top portion of the image. If the fold percentage is greater than what's visible in the thumbnail's aspect ratio, the line won't appear.

```css
/* Thumbnail container clips overflow */
.thumbnail-link {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden; /* Fold line hidden if below visible area */
}

/* The ::after element uses percentage of the thumbnail container,
   NOT the actual image. This means the fold line position needs
   adjustment for the thumbnail's effective visible area. */
```

**Critical calculation for thumbnails:**
- Thumbnail aspect ratio: 16:10 (1.6)
- Screenshot aspect ratio: varies (e.g., 400:3000 = 0.133 for a tall page)
- With `object-fit: cover`, image is scaled to fill width, cropped at bottom
- Visible height percentage: `min(100, thumbnailAspectRatio / screenshotAspectRatio * 100)`

For accurate thumbnail fold lines:
```typescript
function calculateThumbnailFoldPercent(
  viewportHeight: number,
  screenshotWidth: number,
  screenshotHeight: number,
  thumbnailAspectRatio: number = 1.6 // 16/10
): number | null {
  const screenshotAspectRatio = screenshotWidth / screenshotHeight;

  // What percentage of the screenshot is visible in thumbnail?
  const visiblePercent = Math.min(100, thumbnailAspectRatio / screenshotAspectRatio * 100);

  // Fold position as percentage of screenshot
  const foldPercent = (viewportHeight / screenshotHeight) * 100;

  // Is fold within visible area?
  if (foldPercent > visiblePercent) {
    return null; // Fold not visible in thumbnail
  }

  // Scale fold position to thumbnail's coordinate system
  // The thumbnail's 100% height corresponds to visiblePercent of the screenshot
  return (foldPercent / visiblePercent) * 100;
}
```

### Pattern 5: Lightbox Fold Line (Simpler)

**What:** Position fold line in lightbox view
**When to use:** For full-size image viewing
**Insight:** Lightbox uses `object-fit: contain`, showing entire image. Fold percentage maps directly.

```css
.lightbox-image-container {
  position: relative;
  display: inline-block;
}

.lightbox-image-container::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: var(--fold-position, 100%);
  border-top: 2px dashed rgba(255, 100, 100, 0.6);
  pointer-events: none;
}
```

However, with `object-fit: contain`, the image may not fill the container. The `::after` positions relative to the container, not the image content. This requires either:
1. **Wrapper approach:** Wrap image in container sized to match image aspect ratio
2. **CSS calculation:** Calculate container dimensions based on viewport constraints

**Recommended:** Wrap lightbox image in a container that matches the image's displayed dimensions.

### Anti-Patterns to Avoid

- **Pixel values for fold position:** Breaks on different screen sizes
- **JavaScript for positioning:** Violates CSS-only requirement (FOLD-05)
- **Baking fold into screenshot image:** Violates FOLD-05 explicitly
- **Same fold percentage for thumbnail and lightbox:** Different scaling requires different calculations
- **Ignoring `object-fit` behavior:** Leads to misaligned fold lines

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PNG dimension reading | Full PNG parser | Read bytes 16-23 from buffer | PNG spec guarantees IHDR is first chunk |
| Line drawing | Canvas/SVG | CSS border | Simpler, matches existing styling approach |
| Image scaling math | Manual calculations | CSS percentage positioning | Browser handles scaling |
| Responsive behavior | JavaScript resize handlers | CSS-only with percentages | Meets FOLD-05 requirement |

**Key insight:** The fold line is purely a CSS styling concern. All positioning should be CSS-based with percentage values calculated at report generation time.

## Common Pitfalls

### Pitfall 1: Positioning Relative to Container vs Image

**What goes wrong:** Fold line appears in wrong position because `::after` positions relative to container, not image content
**Why it happens:** `object-fit: contain` leaves empty space in container; `object-fit: cover` crops image
**How to avoid:**
- For thumbnails: Calculate adjusted percentage accounting for visible area
- For lightbox: Use wrapper element sized to match image dimensions
**Warning signs:** Fold line doesn't align with actual viewport boundary in image

### Pitfall 2: Unknown Screenshot Height

**What goes wrong:** Cannot calculate fold percentage without knowing actual screenshot dimensions
**Why it happens:** Full-page screenshots have variable height; only viewport dimensions are in Device type
**How to avoid:**
- Parse PNG buffer to extract dimensions
- Or modify capturer to return screenshot dimensions
**Warning signs:** Fold line at wrong position or missing

### Pitfall 3: Fold Line Hidden by Overflow

**What goes wrong:** Fold line doesn't appear even though percentage is set
**Why it happens:** `overflow: hidden` on container clips the `::after` pseudo-element
**How to avoid:** This is actually correct behavior - fold outside visible area shouldn't show
**Warning signs:** None - this is expected for long pages

### Pitfall 4: Inconsistent Line Appearance Across Browsers

**What goes wrong:** Dashed line looks different in different browsers
**Why it happens:** Dashed border rendering is browser-dependent
**How to avoid:**
- Accept minor variations (they're cosmetic)
- Or use gradient-based dashed line for exact control
**Warning signs:** Visual differences between Chrome/Firefox/Safari

### Pitfall 5: Fold Line Obscuring Content

**What goes wrong:** Fold line is too prominent and distracts from screenshot content
**Why it happens:** High opacity, thick border, or solid color
**How to avoid:**
- Use semi-transparent color (rgba with 0.4-0.6 alpha)
- Use dashed style (not solid)
- Use thin line (1-2px)
- Use subtle color that doesn't clash
**Warning signs:** User feedback that line is distracting

## Code Examples

### Complete Fold Line CSS

```css
/* Source: Research synthesis - W3Schools overlays + MDN positioning */

/* Thumbnail fold line */
.thumbnail-link {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.thumbnail-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: var(--fold-position, 200%); /* Default hidden */
  height: 0;
  border-top: 2px dashed rgba(255, 100, 100, 0.5);
  pointer-events: none;
  z-index: 10;
}

/* Lightbox fold line */
.lightbox-content {
  position: relative;
  display: inline-block;
}

.lightbox-content::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: var(--fold-position, 200%);
  height: 0;
  border-top: 2px dashed rgba(255, 100, 100, 0.5);
  pointer-events: none;
  z-index: 10;
}

/* Optional: Fold line label */
.thumbnail-link::before {
  content: 'fold';
  position: absolute;
  left: 4px;
  top: calc(var(--fold-position, 200%) - 10px);
  font-size: 10px;
  color: rgba(255, 100, 100, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  pointer-events: none;
  z-index: 11;
}
```

### PNG Dimension Extraction

```typescript
// Source: PNG Specification - IHDR chunk structure
// https://www.w3.org/TR/PNG/#11IHDR

/**
 * Extract width and height from PNG buffer without external dependencies.
 * PNG files have a fixed header structure:
 * - Bytes 0-7: PNG signature
 * - Bytes 8-11: IHDR chunk length (always 13)
 * - Bytes 12-15: IHDR chunk type
 * - Bytes 16-19: Image width (big-endian)
 * - Bytes 20-23: Image height (big-endian)
 */
export function getPngDimensions(buffer: Buffer): { width: number; height: number } {
  // Verify PNG signature
  const signature = buffer.subarray(0, 8);
  const expectedSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  if (!signature.equals(expectedSignature)) {
    throw new Error('Invalid PNG file: incorrect signature');
  }

  // Read IHDR chunk (always first chunk after signature)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height };
}
```

### Fold Position Calculator

```typescript
// Source: Research synthesis

interface FoldCalculation {
  /** Fold position as percentage of full screenshot (for lightbox) */
  lightboxPercent: number;
  /** Fold position as percentage of visible thumbnail area, or null if not visible */
  thumbnailPercent: number | null;
}

const THUMBNAIL_ASPECT_RATIO = 16 / 10; // Matches CSS

/**
 * Calculate fold line positions for both thumbnail and lightbox views.
 *
 * @param viewportHeight - Device viewport height (the fold position in pixels)
 * @param screenshotWidth - Actual screenshot width in pixels
 * @param screenshotHeight - Actual screenshot height in pixels
 * @returns Fold positions for lightbox and thumbnail
 */
export function calculateFoldPositions(
  viewportHeight: number,
  screenshotWidth: number,
  screenshotHeight: number
): FoldCalculation {
  // Lightbox: direct percentage of screenshot height
  const lightboxPercent = (viewportHeight / screenshotHeight) * 100;

  // Thumbnail: need to account for object-fit: cover cropping
  const screenshotAspectRatio = screenshotWidth / screenshotHeight;

  // Calculate what percentage of screenshot is visible in thumbnail
  // With object-fit: cover and object-position: top:
  // - Image is scaled to fill width
  // - Height is cropped from bottom
  const visibleHeightPercent = Math.min(
    100,
    (THUMBNAIL_ASPECT_RATIO / screenshotAspectRatio) * 100
  );

  // Is the fold within the visible area?
  let thumbnailPercent: number | null = null;
  if (lightboxPercent <= visibleHeightPercent) {
    // Scale to thumbnail's coordinate system
    // Thumbnail's 100% = visibleHeightPercent of screenshot
    thumbnailPercent = (lightboxPercent / visibleHeightPercent) * 100;
  }

  return {
    lightboxPercent,
    thumbnailPercent,
  };
}
```

### Updated ScreenshotForReport Type

```typescript
// Source: Existing types.ts + fold line requirements

/**
 * Screenshot data prepared for HTML report generation
 */
export interface ScreenshotForReport {
  /** Device display name */
  deviceName: string;
  /** Device category for grouping */
  category: DeviceCategory;
  /** Viewport width */
  width: number;
  /** Viewport height (the fold position) */
  height: number;
  /** Base64 data URI (data:image/png;base64,...) */
  dataUri: string;
  /** Actual screenshot width in pixels (may differ from viewport due to full-page capture) */
  screenshotWidth: number;
  /** Actual screenshot height in pixels (full-page height) */
  screenshotHeight: number;
  /** Fold position for lightbox (percentage of screenshot height) */
  foldPositionLightbox: number;
  /** Fold position for thumbnail (percentage of visible area, or null if not visible) */
  foldPositionThumbnail: number | null;
}
```

### HTML Generation with Fold Position

```typescript
// Source: Existing reporter.ts patterns + fold line research

function renderThumbnailCard(screenshot: ScreenshotForReport): string {
  const lightboxId = generateLightboxId(
    screenshot.deviceName,
    screenshot.width,
    screenshot.height
  );

  // Build style attribute for fold position
  const foldStyle = screenshot.foldPositionThumbnail !== null
    ? `style="--fold-position: ${screenshot.foldPositionThumbnail.toFixed(2)}%;"`
    : '';

  return `<div class="thumbnail-card">
    <a href="#${lightboxId}" class="thumbnail-link" ${foldStyle}>
      <img src="${screenshot.dataUri}" alt="${escapeHtml(screenshot.deviceName)}">
    </a>
    <div class="thumbnail-info">
      <div class="device-name">${escapeHtml(screenshot.deviceName)}</div>
      <div class="dimensions">${screenshot.width} x ${screenshot.height}</div>
    </div>
  </div>`;
}

function renderLightbox(screenshot: ScreenshotForReport): string {
  const lightboxId = generateLightboxId(
    screenshot.deviceName,
    screenshot.width,
    screenshot.height
  );

  const foldStyle = `--fold-position: ${screenshot.foldPositionLightbox.toFixed(2)}%;`;

  return `<a href="#_" class="lightbox" id="${lightboxId}">
    <span class="lightbox-close">&times;</span>
    <div class="lightbox-content" style="${foldStyle}">
      <img src="${screenshot.dataUri}" alt="${escapeHtml(screenshot.deviceName)} - Full Size">
    </div>
    <div class="lightbox-info">
      <strong>${escapeHtml(screenshot.deviceName)}</strong> - ${screenshot.width} x ${screenshot.height}
    </div>
  </a>`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Image maps for overlays | CSS `::after` pseudo-elements | 2010s | Cleaner, no extra markup |
| Pixel positioning | Percentage + CSS custom properties | CSS3 (2010+) | Responsive, scale-independent |
| JavaScript resize handlers | CSS-only with percentages | Modern CSS | No JS needed |
| External SVG overlays | CSS borders | Always available | Simpler for straight lines |

**Current best practices:**
- CSS custom properties for dynamic per-element values
- Percentage-based positioning for responsiveness
- Semi-transparent dashed borders for non-intrusive indicators
- `pointer-events: none` to prevent overlay from blocking interaction

**Deprecated/outdated:**
- JavaScript-based overlay positioning (not needed for static indicators)
- External overlay images (adds HTTP requests, complexity)

## Open Questions

Things that require implementation-time decisions:

1. **Fold line color choice**
   - What we know: Must be semi-transparent and non-intrusive (FOLD-04)
   - Options: Red/coral (`rgba(255, 100, 100, 0.5)`), blue, neutral gray
   - Recommendation: Red-coral provides good contrast on most screenshots without being harsh

2. **Label for fold line**
   - What we know: Not required by specs, but could aid understanding
   - What's unclear: Whether to show "fold" or "viewport" label
   - Recommendation: Start without label, add if user feedback indicates confusion

3. **Lightbox container sizing**
   - What we know: `object-fit: contain` doesn't guarantee image fills container
   - Options: JavaScript to size container, or wrapper div with aspect-ratio
   - Recommendation: Use aspect-ratio on wrapper calculated from screenshot dimensions

4. **Performance with many screenshots**
   - What we know: 57 devices with individual fold calculations
   - What's unclear: Any measurable performance impact
   - Recommendation: Unlikely to be significant; calculations are simple arithmetic

## Sources

### Primary (HIGH confidence)
- [MDN CSS position](https://developer.mozilla.org/en-US/docs/Web/CSS/position) - Positioning fundamentals
- [MDN CSS ::after](https://developer.mozilla.org/en-US/docs/Web/CSS/::after) - Pseudo-element syntax
- [MDN border-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-style) - Dashed border options
- [W3 PNG Specification](https://www.w3.org/TR/PNG/#11IHDR) - PNG header structure for dimension extraction
- Existing `/src/output/reporter.ts` - Current report architecture and patterns

### Secondary (MEDIUM confidence)
- [CSS-Tricks aspect-ratio](https://css-tricks.com/almanac/properties/a/aspect-ratio/) - Aspect ratio patterns
- [CSS-Tricks absolute positioning](https://css-tricks.com/absolute-positioning-inside-relative-positioning/) - Container positioning
- [web.dev aspect-ratio](https://web.dev/articles/aspect-ratio) - Modern aspect ratio usage
- [W3Schools CSS Overlay](https://www.w3schools.com/howto/howto_css_overlay.asp) - Overlay patterns

### Tertiary (LOW confidence)
- [CSS-Tricks Responsive Web Above The Fold](https://css-tricks.com/responsive-web-above-the-fold/) - Fold concept context
- Various WebSearch results on fold indicators and overlay positioning

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses only CSS patterns already in the codebase
- Architecture: HIGH - Extension of existing reporter patterns
- Fold calculations: HIGH - Based on documented CSS behavior (object-fit, percentage positioning)
- Pitfalls: MEDIUM - Based on CSS positioning knowledge, may surface new issues during implementation

**Research date:** 2026-01-21
**Valid until:** 2026-03-21 (60 days - stable CSS patterns, no fast-moving dependencies)
