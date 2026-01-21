# Phase 22: Report Cleanup - Research

**Researched:** 2026-01-21
**Domain:** HTML report code removal (fold line indicator)
**Confidence:** HIGH

## Summary

This phase removes the fold line indicator from the HTML report. The fold line was added in Phase 17 (v2.1) to show where the viewport boundary falls on full-page screenshots. With Phase 21 changing the default capture to viewport-only, the fold line is now redundant - the screenshot itself ends at the viewport boundary, so no visual indicator is needed.

The fold line implementation consists of:
1. **CSS styles** - `::after` pseudo-elements on `.thumbnail-link` and `.lightbox-content`
2. **HTML attributes** - `style="--fold-position: X%;"` on thumbnails and lightbox wrappers
3. **TypeScript functions** - `calculateFoldPositions()`, `getPngDimensions()` (only used for fold)
4. **Type definitions** - `screenshotWidth`, `screenshotHeight`, `foldPositionLightbox`, `foldPositionThumbnail` in `ScreenshotForReport`
5. **Tests** - 19 tests for fold line functionality

**Primary recommendation:** Remove all fold-related code in a single plan. This is a deletion-focused task with no new dependencies or patterns to learn.

## Standard Stack

### No External Dependencies

This phase removes code rather than adding it. No new libraries or tools required.

| Component | Action | Files Affected |
|-----------|--------|----------------|
| CSS fold line styles | Remove | `src/output/reporter.ts` (CSS_STYLES constant) |
| HTML fold positioning | Remove | `src/output/reporter.ts` (renderThumbnailCard, renderLightbox) |
| Fold calculation functions | Remove | `src/output/reporter.ts` (calculateFoldPositions, getPngDimensions) |
| Type definitions | Simplify | `src/output/types.ts` (ScreenshotForReport interface) |
| Data preparation | Simplify | `src/output/reporter.ts` (prepareScreenshotsForReport) |
| Tests | Update | `src/output/__tests__/reporter.test.ts` |

## Architecture Patterns

### Pattern 1: Clean Deletion Without Breaking Consumers

**What:** Remove fold-related code while preserving working HTML report
**When to use:** For this phase - removing obsolete feature

**Strategy:**
1. Remove from top to bottom (CSS first, then HTML generation, then helpers, then types)
2. Compile TypeScript after each removal to catch any missed references
3. Update tests to remove fold-specific assertions
4. Verify report still generates correctly without fold data

### Recommended File Modification Order

```
1. src/output/reporter.ts
   ├── Remove fold line CSS from CSS_STYLES constant
   ├── Simplify renderThumbnailCard (remove fold style attribute)
   ├── Simplify renderLightbox (remove lightbox-content wrapper div)
   ├── Remove calculateFoldPositions function
   ├── Remove getPngDimensions function (if only used for fold)
   └── Simplify prepareScreenshotsForReport (remove fold calculations)

2. src/output/types.ts
   └── Remove fold-related fields from ScreenshotForReport

3. src/output/__tests__/reporter.test.ts
   └── Remove fold line tests, update affected test fixtures
```

### Pattern 2: Preserve Lightbox Container Structure

**What:** Keep `.lightbox-content` wrapper if needed for existing CSS
**When to use:** If removing the wrapper breaks lightbox layout

**Analysis:** The `.lightbox-content` div was added specifically for fold line positioning. Looking at the CSS:
- The wrapper is `position: relative; display: inline-block;`
- The image inside is plain `<img>` with no special styling that depends on wrapper

**Recommendation:** The wrapper can be safely removed. The lightbox worked before Phase 17 without it.

### Anti-Patterns to Avoid

- **Partial removal:** Leaving orphaned CSS or unused type fields
- **Breaking changes to types:** Removing fields without updating all consumers
- **Forgetting tests:** Old test fixtures still reference fold fields

## Don't Hand-Roll

| Problem | Don't Build | Just Do | Why |
|---------|-------------|---------|-----|
| Verifying removal is complete | Custom static analysis | TypeScript compiler + grep | TSC catches type errors, grep catches string references |
| Testing report works | New integration tests | Existing report generation test | Already tests report.html is valid |

## Common Pitfalls

### Pitfall 1: Leaving Dead CSS

**What goes wrong:** CSS rules remain that target removed classes or pseudo-elements
**Why it happens:** CSS doesn't error on unused selectors
**How to avoid:** Search for all fold-related CSS patterns: `--fold-position`, `.lightbox-content::after`, `.thumbnail-link::after`
**Warning signs:** Report file larger than expected

### Pitfall 2: Type Mismatch in Tests

**What goes wrong:** Test fixtures still include removed type fields
**Why it happens:** TypeScript doesn't catch object literals with extra properties
**How to avoid:** Update all mock objects in tests when changing ScreenshotForReport
**Warning signs:** Tests pass but have dead code

### Pitfall 3: Missing Export Removal

**What goes wrong:** Functions are removed but still exported, causing import errors
**Why it happens:** Export statements separate from function definitions
**How to avoid:** Check all exports in reporter.ts after removal
**Warning signs:** TypeScript compilation errors

### Pitfall 4: PNG Dimension Function Usage

**What goes wrong:** Removing `getPngDimensions` breaks other features
**Why it happens:** Function might be used elsewhere
**How to avoid:** Check all imports/usages before removing

**Current usage check:**
```typescript
// In reporter.ts:
export function getPngDimensions(buffer: Buffer): { width: number; height: number }
// Used ONLY in prepareScreenshotsForReport for fold calculation
// Safe to remove if fold calculation is removed
```

**Warning signs:** Import errors from other files

## Code Examples

### Before: CSS with Fold Line Styles

```css
.thumbnail-link::after {
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
```

### After: CSS without Fold Line Styles

Remove the entire `::after` pseudo-element blocks and `.lightbox-content` class.

### Before: renderThumbnailCard with Fold

```typescript
export function renderThumbnailCard(screenshot: ScreenshotForReport, url: string): string {
  const lightboxId = generateLightboxId(
    screenshot.deviceName,
    screenshot.width,
    screenshot.height
  );

  // Build fold style attribute if fold is visible in thumbnail
  const foldStyle = screenshot.foldPositionThumbnail !== null
    ? ` style="--fold-position: ${screenshot.foldPositionThumbnail.toFixed(2)}%;"`
    : '';

  // ... rest with foldStyle in template
}
```

### After: renderThumbnailCard without Fold

```typescript
export function renderThumbnailCard(screenshot: ScreenshotForReport, url: string): string {
  const lightboxId = generateLightboxId(
    screenshot.deviceName,
    screenshot.width,
    screenshot.height
  );

  const escapedDeviceName = escapeHtml(screenshot.deviceName);
  const escapedUrl = escapeHtml(url);

  return `<div class="thumbnail-card">
    <a href="#${lightboxId}" class="thumbnail-link">
      <img src="${screenshot.dataUri}" alt="${escapedDeviceName}">
    </a>
    <button type="button" class="preview-btn" onclick="openPreview('${escapedUrl}', ${screenshot.width}, ${screenshot.height})" aria-label="Preview ${escapedDeviceName} at ${screenshot.width}x${screenshot.height}">Preview</button>
    <div class="thumbnail-info">
      <div class="device-name">${escapedDeviceName}</div>
      <div class="dimensions">${screenshot.width} x ${screenshot.height}</div>
    </div>
  </div>`;
}
```

### Before: renderLightbox with Fold Wrapper

```typescript
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

### After: renderLightbox without Fold Wrapper

```typescript
function renderLightbox(screenshot: ScreenshotForReport): string {
  const lightboxId = generateLightboxId(
    screenshot.deviceName,
    screenshot.width,
    screenshot.height
  );

  return `<a href="#_" class="lightbox" id="${lightboxId}">
    <span class="lightbox-close">&times;</span>
    <img src="${screenshot.dataUri}" alt="${escapeHtml(screenshot.deviceName)} - Full Size">
    <div class="lightbox-info">
      <strong>${escapeHtml(screenshot.deviceName)}</strong> - ${screenshot.width} x ${screenshot.height}
    </div>
  </a>`;
}
```

### Before: ScreenshotForReport Type

```typescript
export interface ScreenshotForReport {
  deviceName: string;
  category: DeviceCategory;
  width: number;
  height: number;
  dataUri: string;
  screenshotWidth: number;
  screenshotHeight: number;
  foldPositionLightbox: number;
  foldPositionThumbnail: number | null;
}
```

### After: ScreenshotForReport Type

```typescript
export interface ScreenshotForReport {
  deviceName: string;
  category: DeviceCategory;
  width: number;
  height: number;
  dataUri: string;
}
```

### Before: prepareScreenshotsForReport with Fold Calculation

```typescript
export function prepareScreenshotsForReport(
  results: ExecutionResult[],
  devices: Device[]
): ScreenshotForReport[] {
  // ... device lookup ...

  for (const result of results) {
    if (!result.success || !result.buffer) continue;
    const device = deviceMap.get(result.deviceName);
    if (!device) continue;

    // Extract actual screenshot dimensions from PNG buffer
    const { width: screenshotWidth, height: screenshotHeight } = getPngDimensions(result.buffer);

    // Calculate fold positions for thumbnail and lightbox
    const { lightboxPercent, thumbnailPercent } = calculateFoldPositions(
      device.height,
      screenshotWidth,
      screenshotHeight
    );

    screenshots.push({
      deviceName: device.name,
      category: device.category,
      width: device.width,
      height: device.height,
      dataUri: bufferToDataUri(result.buffer),
      screenshotWidth,
      screenshotHeight,
      foldPositionLightbox: lightboxPercent,
      foldPositionThumbnail: thumbnailPercent,
    });
  }
  // ...
}
```

### After: prepareScreenshotsForReport Simplified

```typescript
export function prepareScreenshotsForReport(
  results: ExecutionResult[],
  devices: Device[]
): ScreenshotForReport[] {
  // ... device lookup ...

  for (const result of results) {
    if (!result.success || !result.buffer) continue;
    const device = deviceMap.get(result.deviceName);
    if (!device) continue;

    screenshots.push({
      deviceName: device.name,
      category: device.category,
      width: device.width,
      height: device.height,
      dataUri: bufferToDataUri(result.buffer),
    });
  }
  // ...
}
```

## State of the Art

| What Was Added | Why It's Now Obsolete | Phase Introduced | Removed In |
|----------------|----------------------|------------------|------------|
| Fold line indicator | Viewport-only capture makes fold = screenshot boundary | Phase 17 (v2.1) | Phase 22 (v3.0) |
| PNG dimension extraction | Only needed for fold position calculation | Phase 17 (v2.1) | Phase 22 (v3.0) |
| Extended ScreenshotForReport type | Fold-related fields no longer needed | Phase 17 (v2.1) | Phase 22 (v3.0) |

**Context:** The fold line was valuable for full-page screenshots (showing what users see without scrolling). With viewport-only default, the entire screenshot IS "above the fold" - no indicator needed.

## Open Questions

None. This is a straightforward code removal task with no architectural decisions required.

## Sources

### Primary (HIGH confidence)
- `/home/memehalis/responsiveness-mcp/src/output/reporter.ts` - Current implementation with fold line code
- `/home/memehalis/responsiveness-mcp/src/output/types.ts` - ScreenshotForReport type with fold fields
- `/home/memehalis/responsiveness-mcp/src/output/__tests__/reporter.test.ts` - Tests for fold line functionality
- `/home/memehalis/responsiveness-mcp/.planning/phases/17-fold-line-indicator/17-RESEARCH.md` - Original fold line implementation research
- `/home/memehalis/responsiveness-mcp/.planning/ROADMAP.md` - v3.0 milestone context

### Secondary (MEDIUM confidence)
- `/home/memehalis/responsiveness-mcp/.planning/REQUIREMENTS.md` - RPT-01, RPT-02, RPT-03 requirements

## Metadata

**Confidence breakdown:**
- Code removal locations: HIGH - Direct inspection of source files
- Type changes: HIGH - TypeScript interface clearly defined
- Test updates: HIGH - Tests directly reference fold functionality

**Research date:** 2026-01-21
**Valid until:** N/A - This is a one-time cleanup task

## Removal Checklist

Items to remove/modify for complete cleanup:

### src/output/reporter.ts
- [ ] Remove `THUMBNAIL_ASPECT_RATIO` constant (line 8)
- [ ] Remove `getPngDimensions()` function (lines 19-33)
- [ ] Remove `calculateFoldPositions()` function (lines 43-75)
- [ ] Remove `.thumbnail-link::after` CSS rule from CSS_STYLES (lines 229-239)
- [ ] Remove `.lightbox-content` and `.lightbox-content::after` CSS rules (lines 318-333)
- [ ] Simplify `renderThumbnailCard()` - remove foldStyle attribute (lines 656-681)
- [ ] Simplify `renderLightbox()` - remove wrapper div and foldStyle (lines 708-726)
- [ ] Simplify `prepareScreenshotsForReport()` - remove dimension extraction and fold calculation (lines 798-837)

### src/output/types.ts
- [ ] Remove `screenshotWidth` field from ScreenshotForReport (line 75)
- [ ] Remove `screenshotHeight` field from ScreenshotForReport (lines 76-77)
- [ ] Remove `foldPositionLightbox` field from ScreenshotForReport (lines 78-79)
- [ ] Remove `foldPositionThumbnail` field from ScreenshotForReport (lines 80-81)

### src/output/__tests__/reporter.test.ts
- [ ] Remove `describe('getPngDimensions')` block (lines 270-306)
- [ ] Remove `describe('calculateFoldPositions')` block (lines 308-371)
- [ ] Remove `describe('fold line styles and rendering')` block (lines 589-669)
- [ ] Update mock objects to remove fold-related fields
- [ ] Update any assertions that check for fold-related content

### Estimated Impact
- Lines removed: ~180 lines of code
- Lines modified: ~30 lines
- Tests removed: ~19 tests
- Tests modified: ~10 tests
- Report size reduction: Minor (fold position data was minimal)
