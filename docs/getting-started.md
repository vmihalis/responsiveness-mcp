# Getting Started

## Quick Start

Run without installation:

```bash
npx screenie-tool https://your-site.com
```

Screenshots are saved to `./screenshots/` and an HTML report opens automatically in your browser.

## Installation

### Using npx (recommended)

No installation needed - run directly with npx:

```bash
npx screenie-tool https://your-site.com
```

This is the recommended approach as it always uses the latest version.

### Global Install

For frequent use, install globally:

```bash
npm install -g screenie-tool
```

Then run anywhere:

```bash
screenie https://your-site.com
```

### Updating

To update to the latest version:

```bash
npm update -g screenie-tool
```

Check your current version:

```bash
screenie --version
```

Check if updates are available:

```bash
npm outdated -g screenie-tool
```

## Requirements

- **Node.js 20 or higher** - Required for running the CLI
- **Chromium** - Automatically installed by Playwright on first run (no manual setup needed)

## Basic Usage

Capture all device viewports for a website:

```bash
npx screenie-tool https://example.com
```

Screenshots capture the visible viewport by default. For full-page capture, add the `--full-page` flag.

This will:
1. Launch Chromium browser
2. Capture screenshots across 57 device viewports
3. Save images to `./screenshots/` directory
4. Generate and open an HTML report

## What Happens Next

After running screenie, you'll see:

- **Progress spinner** showing capture status
- **Screenshot files** in `./screenshots/` directory
- **HTML report** opening in your browser with a grid view of all captures

Screenie captures viewport screenshots across 57 device viewports by default.

Each screenshot is named with the device name (e.g., `iPhone-15-Pro-Max.png`) for easy identification.

## Output Structure

```
./screenshots/
├── index.html           # Visual report
├── iPhone-15-Pro-Max.png
├── iPhone-15-Pro.png
├── iPhone-SE.png
├── iPad-Pro-13.png
└── ... (57 total screenshots)
```

The HTML report displays all screenshots in a responsive grid with device labels, making it easy to spot layout issues across different viewports.

## Next Steps

- Learn about all available options in the [CLI Reference](/cli-reference)
- See real-world usage patterns in [Examples](/examples)
