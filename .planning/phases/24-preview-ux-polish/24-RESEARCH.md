# Phase 24: Preview UX Polish - Research

**Researched:** 2026-01-22
**Domain:** CSS modal styling, button prominence, viewport centering, HTML dialog element
**Confidence:** HIGH

## Summary

This phase focuses on improving the preview modal and button UX in the existing HTML report. The current implementation uses the native HTML `<dialog>` element with `showModal()`, which is the correct foundation, but has several UX issues: the preview button is hidden until hover (accessibility/discoverability problem), the modal lacks device information in the header, and the modal/iframe sizing needs adjustment to fill 80-90% of viewport.

The fixes are primarily CSS changes with minor HTML structure updates. The native `<dialog>` element's centering relies on `margin: auto` combined with `position: fixed` and `inset: 0` - any "left-drift" issues are likely caused by missing or conflicting CSS rules. The key insight is that `<dialog>` centering is well-supported but requires explicit CSS rules in some browsers.

**Primary recommendation:** Update CSS to make preview button always visible with prominent styling, add device name/dimensions to modal header HTML, and ensure modal uses explicit centering CSS (`margin: auto; inset: 0; position: fixed`) with 80-90% viewport dimensions.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native `<dialog>` | HTML5 | Modal dialogs | Already in use, correct choice for 2026, no changes needed |
| CSS viewport units | CSS3 | Responsive sizing | `vw`, `vh`, `dvh` for viewport-relative sizing |
| CSS Flexbox | CSS3 | Centering content | Standard for centering iframe within modal body |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS Custom Properties | CSS3 | Button color theming | Optional - for consistent button styling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS only button styling | JavaScript visibility toggle | Adds complexity, CSS-only is sufficient |
| Percentage sizing | Fixed pixel dimensions | Percentages are more responsive |
| Transform centering | margin: auto | margin: auto is more standard for dialog |

**Installation:**
```bash
# No additional dependencies needed - CSS-only changes
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── output/
│   └── reporter.ts          # Modify CSS_STYLES and modal template
```

### Pattern 1: Always-Visible Preview Button
**What:** Button is always visible with prominent styling, enhanced on hover
**When to use:** When action should be immediately discoverable
**Example:**
```css
/* Source: UXPin button states best practices */
.preview-btn {
  /* Always visible - no opacity: 0 */
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
}

.preview-btn:hover {
  background: #0052a3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.25);
}

.preview-btn:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

.preview-btn:active {
  transform: translateY(0);
}
```

### Pattern 2: Fixed Viewport Modal with Centered Content
**What:** Modal takes 80-90% of viewport, iframe centered within
**When to use:** Preview/detail modals that need to show large content
**Example:**
```css
/* Source: MDN dialog element, CSS-Tricks modal styling */
.preview-modal {
  border: none;
  border-radius: 12px;
  padding: 0;
  background: white;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);

  /* Explicit centering - prevents left-drift */
  position: fixed;
  inset: 0;
  margin: auto;

  /* 85% of viewport (within 80-90% range) */
  width: 85vw;
  height: 85vh;
  max-width: 85vw;
  max-height: 85vh;

  /* Flexbox for internal layout */
  display: flex;
  flex-direction: column;
}

.preview-modal::backdrop {
  background: rgba(0, 0, 0, 0.85);
}
```

### Pattern 3: Modal Header with Device Information
**What:** Header shows device name and dimensions alongside close button
**When to use:** When context about the preview content is important
**Example:**
```html
<!-- Source: Bootstrap modal header pattern -->
<div class="modal-header">
  <div class="modal-title">
    <span id="modal-device-name" class="device-name">iPhone 14 Pro</span>
    <span id="modal-device-dims" class="device-dims">390 x 844</span>
  </div>
  <button id="close-modal" class="close-btn" aria-label="Close preview">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
```
```css
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.modal-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.device-name {
  font-weight: 600;
  font-size: 1.125rem;
  color: #333;
}

.device-dims {
  font-size: 0.875rem;
  color: #666;
}
```

### Pattern 4: Centered Iframe within Modal Body
**What:** Iframe centered using flexbox, with device dimensions
**When to use:** When iframe should be centered and not stretch to fill
**Example:**
```css
/* Source: Flexbox centering best practices */
.modal-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: hidden;
  background: #f5f5f5;
}

.preview-iframe {
  display: block;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  /* Dimensions set via JS based on device */
}
```

### Anti-Patterns to Avoid
- **Hiding buttons until hover:** Mobile users never see hover states; reduces discoverability for all users
- **Using transform for dialog centering:** `margin: auto` with `inset: 0` is more reliable
- **Fixed pixel dimensions for modal:** Use viewport units (vw/vh) for responsiveness
- **Relying on browser defaults for dialog centering:** Explicitly set centering CSS for cross-browser consistency

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal centering | JavaScript position calculation | CSS `margin: auto; inset: 0` | Native browser centering, no JS needed |
| Button hover transitions | Manual JavaScript animation | CSS transitions | Smoother, GPU-accelerated |
| Responsive modal sizing | JavaScript resize handlers | CSS viewport units (vw/vh) | Automatic, no resize listener needed |
| Focus states | Custom outline logic | `:focus-visible` pseudo-class | Browser handles focus ring visibility |

**Key insight:** All requirements can be achieved with CSS changes only. No JavaScript modifications needed except adding device name/dimensions data attributes to pass to modal.

## Common Pitfalls

### Pitfall 1: Dialog Centering "Left-Drift"
**What goes wrong:** Modal appears offset to the left instead of centered
**Why it happens:** Browser's UA stylesheet has default margins, or explicit margins override auto centering
**How to avoid:**
- Explicitly set `margin: auto` on dialog
- Ensure `position: fixed` and `inset: 0` are set
- Check for any ancestor with `transform` or `backface-visibility: hidden` that could affect fixed positioning
**Warning signs:** Dialog appears left-aligned on page load or after scrolling

### Pitfall 2: Hidden Buttons on Mobile
**What goes wrong:** Preview button never visible because mobile has no hover
**Why it happens:** Using `opacity: 0` with `:hover` to show button
**How to avoid:**
- Make button always visible by default
- Use hover for enhancement (darker color, subtle lift) not revelation
- Test on actual mobile device or device emulation
**Warning signs:** User testing shows mobile users can't find preview action

### Pitfall 3: Modal Overflow on Small Screens
**What goes wrong:** Modal content extends beyond viewport, can't scroll
**Why it happens:** Fixed vw/vh values without max constraints
**How to avoid:**
- Use `max-width: calc(100vw - 2rem)` alongside `width: 85vw`
- Ensure `overflow: auto` or `overflow: hidden` on modal body
- Test at small viewport sizes (320px width)
**Warning signs:** Horizontal scroll appears on mobile, close button cut off

### Pitfall 4: Iframe Not Respecting Device Dimensions
**What goes wrong:** Iframe stretches to fill modal instead of showing at device size
**Why it happens:** Missing explicit width/height, or flexbox stretching
**How to avoid:**
- Set iframe dimensions explicitly in JS before showing
- Don't use `flex: 1` on iframe
- Use `align-items: center; justify-content: center` on parent, not `stretch`
**Warning signs:** Desktop device preview fills entire modal, looks stretched

### Pitfall 5: Button State Transitions Too Fast/Jarring
**What goes wrong:** Button hover feels abrupt or laggy
**Why it happens:** No transition or very short/long transition duration
**How to avoid:**
- Use 150-200ms transition duration for hover effects
- Add `transition: background 0.2s, transform 0.1s` for smooth feel
- Test by rapidly hovering in/out
**Warning signs:** User testing notes button feels "cheap" or "laggy"

## Code Examples

Verified patterns from official sources:

### Complete Preview Button CSS (BTN-01, BTN-02, BTN-03)
```css
/* Source: DesignRush button states best practices, UXPin button design */
.preview-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;

  /* BTN-01: Always visible (removed opacity: 0) */
  /* BTN-02: Larger size with increased padding */
  padding: 0.5rem 1rem;
  font-size: 0.875rem;

  /* BTN-03: Bold styling - prominent and obviously interactive */
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);

  /* Smooth transitions */
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
}

.preview-btn:hover {
  background: #0052a3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.preview-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.preview-btn:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

/* REMOVED: This hover-reveal pattern */
/* .thumbnail-card:hover .preview-btn { opacity: 1; } */
```

### Complete Modal CSS (MODAL-01, MODAL-02, MODAL-03, MODAL-04)
```css
/* Source: MDN dialog element, web.dev dialog component guide */
.preview-modal {
  /* MODAL-01: 80-90% of viewport */
  width: 85vw;
  height: 85vh;
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 2rem);

  /* MODAL-02: Centered (fix left-drift) */
  position: fixed;
  inset: 0;
  margin: auto;

  /* Reset and styling */
  border: none;
  border-radius: 12px;
  padding: 0;
  background: white;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);

  /* Internal layout */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-modal::backdrop {
  background: rgba(0, 0, 0, 0.85);
}

/* MODAL-04: Device name and dimensions in header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  background: white;
}

.modal-title {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.modal-device-name {
  font-weight: 600;
  font-size: 1.125rem;
  color: #333;
}

.modal-device-dims {
  font-size: 0.875rem;
  color: #666;
  font-family: ui-monospace, monospace;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #666;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.close-btn:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* MODAL-03: Iframe centered within modal */
.modal-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: hidden;
  background: #f0f0f0;
}

.preview-iframe {
  display: block;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  /* Width/height set by JS to match device dimensions */
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
  text-align: center;
}
```

### Modal HTML Template Update
```html
<!-- Source: Bootstrap modal pattern for header with title -->
<dialog id="preview-modal" class="preview-modal">
  <div class="modal-content">
    <!-- MODAL-04: Device name and dimensions displayed -->
    <div class="modal-header">
      <div class="modal-title">
        <span id="modal-device-name" class="modal-device-name">Device Name</span>
        <span id="modal-device-dims" class="modal-device-dims">0 x 0</span>
      </div>
      <button id="close-modal" class="close-btn" aria-label="Close preview">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="modal-body">
      <!-- Loading state -->
      <div id="loading-state" class="loading-state" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Loading preview...</p>
      </div>

      <!-- Iframe preview -->
      <iframe
        id="preview-iframe"
        class="preview-iframe"
        sandbox="allow-scripts allow-forms allow-same-origin"
        title="Interactive preview"
        hidden>
      </iframe>

      <!-- Error state -->
      <div id="error-state" class="error-state" hidden>
        <!-- ... error content ... -->
      </div>
    </div>
  </div>
</dialog>
```

### JavaScript Update for Device Info
```javascript
/* Source: Derived from existing modal JS */
function openPreview(url, width, height, deviceName) {
  previouslyFocusedElement = document.activeElement;

  // MODAL-04: Update device name and dimensions in header
  document.getElementById('modal-device-name').textContent = deviceName;
  document.getElementById('modal-device-dims').textContent = width + ' x ' + height;

  // Reset states
  loadingState.hidden = false;
  iframe.hidden = true;
  errorState.hidden = true;

  // Set iframe dimensions with viewport constraints
  var maxWidth = window.innerWidth * 0.8;
  var maxHeight = window.innerHeight * 0.75;
  iframe.style.width = Math.min(width, maxWidth) + 'px';
  iframe.style.height = Math.min(height, maxHeight) + 'px';
  fallbackLink.href = url;

  // Show modal
  modal.showModal();

  // Load iframe with timeout detection
  loadIframeWithTimeout(iframe, url);
}
```

### Preview Button HTML Update
```html
<!-- Source: Updated to pass device name -->
<button
  type="button"
  class="preview-btn"
  onclick="openPreview('${escapedUrl}', ${screenshot.width}, ${screenshot.height}, '${escapedDeviceName}')"
  aria-label="Preview ${escapedDeviceName} at ${screenshot.width}x${screenshot.height}">
  Preview
</button>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hide button until hover | Always visible with hover enhancement | 2024+ mobile-first | Better discoverability, mobile-friendly |
| `vh` for modal height | `dvh` (dynamic viewport height) | 2023 | Handles mobile keyboard/URL bar better |
| Transform centering | `margin: auto; inset: 0` | 2022+ with dialog | Simpler, more reliable for dialog |
| Percentage width/height | Viewport units (vw/vh) | Established | More predictable, viewport-relative |

**Deprecated/outdated:**
- **opacity: 0 for buttons on cards**: Mobile has no hover; always visible is the standard
- **Using `vh` on mobile**: `dvh` accounts for dynamic browser chrome; use for modal height
- **Manual centering calculations**: Native dialog + CSS handles centering automatically

## Open Questions

Things that couldn't be fully resolved:

1. **Exact 80% vs 85% vs 90% viewport sizing**
   - What we know: Requirement says 80-90%, examples commonly use 85%
   - What's unclear: User preference for specific value
   - Recommendation: Use 85vw/85vh as default; easy to adjust via CSS

2. **Device dimensions that exceed modal bounds**
   - What we know: Large desktop viewports (1920x1080) may exceed 85% of small screens
   - What's unclear: How to handle - scroll, scale down, or limit?
   - Recommendation: Cap iframe at `Math.min(deviceWidth, maxWidth)` where maxWidth is ~80% of modal

3. **Dynamic viewport height (dvh) support**
   - What we know: `dvh` is better for mobile but not universally supported in older browsers
   - What's unclear: Target browser support requirements for this project
   - Recommendation: Use `vh` with fallback; `dvh` as progressive enhancement if needed

## Sources

### Primary (HIGH confidence)
- [MDN: `<dialog>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) - Official dialog element documentation
- [MDN: Viewport concepts](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts) - Viewport units explanation
- [web.dev: Building a dialog component](https://web.dev/articles/building/a-dialog-component) - Google's dialog implementation guide
- [Bootstrap Modal docs](https://getbootstrap.com/docs/5.3/components/modal/) - Modal header pattern reference

### Secondary (MEDIUM confidence)
- [UXPin: Button States Explained](https://www.uxpin.com/studio/blog/button-states/) - Button design best practices
- [DesignRush: Button States 2026](https://www.designrush.com/best-designs/websites/trends/button-states) - Current button state trends
- [CSS-Tricks: Considerations for Styling a Modal](https://css-tricks.com/considerations-styling-modal/) - Modal styling patterns
- [Simon Willison: Dialog full height TIL](https://til.simonwillison.net/css/dialog-full-height) - Dialog sizing techniques
- [W3C CSSWG Issue #4645](https://github.com/w3c/csswg-drafts/issues/4645) - Dialog positioning CSS spec discussion

### Tertiary (LOW confidence)
- [SheCodes: Creating Centered Modals with CSS Flexbox](https://www.shecodes.io/athena/2095-creating-centered-modals-with-css-flexbox) - Educational resource
- Various CodePen examples for flexbox modal patterns

## Metadata

**Confidence breakdown:**
- Button styling (BTN-01, BTN-02, BTN-03): HIGH - CSS-only changes, well-documented patterns
- Modal sizing (MODAL-01): HIGH - Viewport units are standard, straightforward implementation
- Modal centering (MODAL-02): HIGH - `margin: auto; inset: 0` is documented standard for dialog
- Iframe centering (MODAL-03): HIGH - Flexbox centering is well-established
- Header info (MODAL-04): HIGH - Minor HTML/JS changes, Bootstrap pattern reference

**Research date:** 2026-01-22
**Valid until:** 2026-03-22 (60 days - stable CSS domain, no fast-moving libraries)
