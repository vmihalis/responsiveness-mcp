import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReportData, ScreenshotForReport } from './types.js';
import type { DeviceCategory, Device } from '../devices/types.js';
import type { ExecutionResult } from '../engine/types.js';

/** Thumbnail aspect ratio constant to match CSS */
const THUMBNAIL_ASPECT_RATIO = 16 / 10; // 1.6

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
  const expectedSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  if (!signature.equals(expectedSignature)) {
    throw new Error('Invalid PNG file: incorrect signature');
  }

  // Read IHDR chunk (always first chunk after signature)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height };
}

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
): { lightboxPercent: number; thumbnailPercent: number | null } {
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

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert Buffer to base64 data URI for embedding in HTML
 */
export function bufferToDataUri(buffer: Buffer): string {
  const base64 = buffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

/**
 * Format milliseconds to human readable duration
 */
export function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Generate unique HTML-safe ID for lightbox anchor
 */
export function generateLightboxId(
  deviceName: string,
  width: number,
  height: number
): string {
  const safeName = deviceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `lb-${safeName}-${width}x${height}`;
}

/**
 * Group screenshots by device category
 */
export function groupByCategory(
  screenshots: ScreenshotForReport[]
): Map<DeviceCategory, ScreenshotForReport[]> {
  const grouped = new Map<DeviceCategory, ScreenshotForReport[]>();

  for (const screenshot of screenshots) {
    const existing = grouped.get(screenshot.category) ?? [];
    existing.push(screenshot);
    grouped.set(screenshot.category, existing);
  }

  return grouped;
}

/**
 * Get human-readable display name for device category
 */
export function getCategoryDisplayName(category: DeviceCategory): string {
  const names: Record<DeviceCategory, string> = {
    phones: 'Phones',
    tablets: 'Tablets',
    'pc-laptops': 'Desktop & Laptops',
  };
  return names[category];
}

/**
 * CSS styles for the HTML report
 * Includes reset, layout, thumbnail grid, and lightbox styles
 */
const CSS_STYLES = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

[hidden] {
  display: none !important;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.5;
}

.report-header {
  background: #fff;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.report-header h1 {
  margin-bottom: 1rem;
}

.metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}

.metadata p {
  margin: 0;
}

.category-section {
  background: #fff;
  margin: 0 1rem 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.category-section h2 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.thumbnail-card {
  background: #fafafa;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #eee;
}

.thumbnail-link {
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  position: relative;
}

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

.thumbnail-link img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform 0.2s;
}

.thumbnail-link:hover img {
  transform: scale(1.02);
}

.thumbnail-info {
  padding: 0.75rem;
  font-size: 0.875rem;
}

.thumbnail-info .device-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.thumbnail-info .dimensions {
  color: #666;
}

/* Lightbox styles */
.lightbox {
  display: none;
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
}

.lightbox:target {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #fff;
  font-size: 2rem;
  text-decoration: none;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
}

.lightbox-close:hover {
  background: rgba(255,255,255,0.2);
}

.lightbox img {
  max-width: 95vw;
  max-height: 85vh;
  object-fit: contain;
}

.lightbox-info {
  color: #fff;
  margin-top: 1rem;
  text-align: center;
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

/* Preview Modal styles */
.preview-modal {
  border: none;
  border-radius: 8px;
  padding: 0;
  max-width: 95vw;
  max-height: 95vh;
  background: white;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.preview-modal::backdrop {
  background: rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.close-btn:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.modal-body {
  padding: 1rem;
  position: relative;
}

.preview-iframe {
  display: block;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0066cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error-icon {
  color: #d32f2f;
  margin-bottom: 1rem;
}

.error-state h3 {
  margin: 1rem 0 0.5rem;
  color: #333;
}

.error-state p {
  margin: 0 0 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.fallback-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #0066cc;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background 0.2s;
}

.fallback-btn:hover {
  background: #0052a3;
}

.fallback-btn:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Preview button overlay */
.thumbnail-card {
  position: relative;
}

.preview-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 102, 204, 0.9);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 5;
}

.thumbnail-card:hover .preview-btn {
  opacity: 1;
}

.preview-btn:hover {
  background: rgba(0, 82, 163, 0.95);
}

.preview-btn:focus-visible {
  opacity: 1;
  outline: 2px solid white;
  outline-offset: 2px;
}
`;

/**
 * Generate the interactive preview modal template with dialog, iframe, and JavaScript.
 * The modal allows users to view the captured site at device viewport dimensions.
 * @param url - The URL of the captured site
 * @returns Complete modal HTML including dialog, CSS, and JavaScript
 */
export function generateModalTemplate(url: string): string {
  const escapedUrl = escapeHtml(url);
  return `<dialog id="preview-modal" class="preview-modal">
  <div class="modal-content">
    <div class="modal-header">
      <button id="close-modal" class="close-btn" autofocus aria-label="Close preview">
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
        title="Interactive preview of ${escapedUrl}"
        hidden>
      </iframe>

      <!-- Error state -->
      <div id="error-state" class="error-state" hidden>
        <svg class="error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/>
        </svg>
        <h3>Preview Unavailable</h3>
        <p>This site cannot be displayed in a frame due to security restrictions (X-Frame-Options or Content-Security-Policy).</p>
        <a id="fallback-link" href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="fallback-btn">
          Open in New Tab
        </a>
      </div>
    </div>
  </div>
</dialog>

<script>
(function() {
  var modal = document.getElementById('preview-modal');
  var closeBtn = document.getElementById('close-modal');
  var iframe = document.getElementById('preview-iframe');
  var loadingState = document.getElementById('loading-state');
  var errorState = document.getElementById('error-state');
  var fallbackLink = document.getElementById('fallback-link');

  var previouslyFocusedElement = null;
  var IFRAME_TIMEOUT_MS = 10000;

  function openPreview(url, width, height) {
    previouslyFocusedElement = document.activeElement;

    // Reset states
    loadingState.hidden = false;
    iframe.hidden = true;
    errorState.hidden = true;

    // Set iframe dimensions with viewport constraints
    iframe.style.width = Math.min(width, window.innerWidth * 0.9) + 'px';
    iframe.style.height = Math.min(height, window.innerHeight * 0.8) + 'px';
    fallbackLink.href = url;

    // Show modal
    modal.showModal();

    // Load iframe with timeout detection
    loadIframeWithTimeout(iframe, url);
  }

  function loadIframeWithTimeout(iframe, url) {
    var loaded = false;

    var timeoutId = setTimeout(function() {
      if (!loaded) {
        showError();
      }
    }, IFRAME_TIMEOUT_MS);

    iframe.addEventListener('load', function() {
      clearTimeout(timeoutId);
      loaded = true;
      showIframe();
    }, { once: true });

    iframe.src = url;
  }

  function showIframe() {
    loadingState.hidden = true;
    iframe.hidden = false;
    errorState.hidden = true;
  }

  function showError() {
    loadingState.hidden = true;
    iframe.hidden = true;
    errorState.hidden = false;
  }

  function closeModal() {
    modal.close();
    iframe.src = 'about:blank'; // Stop loading
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }

  // Close button handler
  closeBtn.addEventListener('click', closeModal);

  // Backdrop click handler
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close event handler (ESC key triggers this)
  modal.addEventListener('close', function() {
    iframe.src = 'about:blank';
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  });

  // Expose to thumbnail click handlers
  window.openPreview = openPreview;
})();
</script>`;
}

/**
 * Render the report header with metadata
 */
function renderHeader(data: ReportData): string {
  return `<header class="report-header">
    <h1>Responsive Screenshots</h1>
    <div class="metadata">
      <p><strong>URL:</strong> ${escapeHtml(data.url)}</p>
      <p><strong>Captured:</strong> ${data.capturedAt}</p>
      <p><strong>Duration:</strong> ${formatDuration(data.duration)}</p>
      <p><strong>Devices:</strong> ${data.deviceCount}</p>
    </div>
  </header>`;
}

/**
 * Render a single thumbnail card with lightbox link and preview button
 * @param screenshot Screenshot data for the card
 * @param url URL of the captured site for interactive preview
 */
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

  const escapedDeviceName = escapeHtml(screenshot.deviceName);
  const escapedUrl = escapeHtml(url);

  return `<div class="thumbnail-card">
    <a href="#${lightboxId}" class="thumbnail-link"${foldStyle}>
      <img src="${screenshot.dataUri}" alt="${escapedDeviceName}">
    </a>
    <button type="button" class="preview-btn" onclick="openPreview('${escapedUrl}', ${screenshot.width}, ${screenshot.height})" aria-label="Preview ${escapedDeviceName} at ${screenshot.width}x${screenshot.height}">Preview</button>
    <div class="thumbnail-info">
      <div class="device-name">${escapedDeviceName}</div>
      <div class="dimensions">${screenshot.width} x ${screenshot.height}</div>
    </div>
  </div>`;
}

/**
 * Render a category section with all its thumbnails
 * @param category Device category (phones, tablets, pc-laptops)
 * @param screenshots Screenshots for this category
 * @param url URL of the captured site for interactive preview
 */
function renderCategory(
  category: DeviceCategory,
  screenshots: ScreenshotForReport[],
  url: string
): string {
  const displayName = getCategoryDisplayName(category);
  const thumbnails = screenshots.map((s) => renderThumbnailCard(s, url)).join('\n    ');

  return `<section class="category-section">
    <h2>${displayName}</h2>
    <div class="thumbnail-grid">
    ${thumbnails}
    </div>
  </section>`;
}

/**
 * Render a lightbox for a single screenshot
 */
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

/**
 * Build complete HTML report from data and screenshots
 */
function buildReportHtml(
  data: ReportData,
  screenshots: ScreenshotForReport[]
): string {
  const grouped = groupByCategory(screenshots);

  // Render categories in fixed order: phones, tablets, pc-laptops
  const categoryOrder: DeviceCategory[] = ['phones', 'tablets', 'pc-laptops'];
  const categorySections: string[] = [];

  for (const category of categoryOrder) {
    const categoryScreenshots = grouped.get(category);
    if (categoryScreenshots && categoryScreenshots.length > 0) {
      categorySections.push(renderCategory(category, categoryScreenshots, data.url));
    }
  }

  // Render all lightboxes
  const lightboxes = screenshots.map(renderLightbox).join('\n');

  // Render preview modal
  const modal = generateModalTemplate(data.url);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Screenshots - ${escapeHtml(data.url)}</title>
  <style>${CSS_STYLES}</style>
</head>
<body>
  ${renderHeader(data)}
  <main>
    ${categorySections.join('\n    ')}
  </main>
  ${lightboxes}
  ${modal}
</body>
</html>`;
}

/**
 * Generate HTML report and write to output directory
 * @param data Report metadata (URL, timestamp, duration, device count)
 * @param screenshots Array of screenshots with base64 data URIs
 * @param outputPath Directory to write report.html to
 * @returns Full path to the generated report file
 */
export async function generateReport(
  data: ReportData,
  screenshots: ScreenshotForReport[],
  outputPath: string
): Promise<string> {
  const html = buildReportHtml(data, screenshots);
  const reportPath = join(outputPath, 'report.html');
  await writeFile(reportPath, html, 'utf-8');
  return reportPath;
}

/**
 * Convert execution results to report-ready screenshots
 * Filters to successful results only and adds base64 data URIs
 * @param results Execution results from parallel capture
 * @param devices Device list for metadata lookup
 * @returns Array of screenshots ready for report generation
 */
export function prepareScreenshotsForReport(
  results: ExecutionResult[],
  devices: Device[]
): ScreenshotForReport[] {
  const deviceMap = new Map<string, Device>();
  for (const device of devices) {
    deviceMap.set(device.name, device);
  }

  const screenshots: ScreenshotForReport[] = [];
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

  return screenshots;
}
