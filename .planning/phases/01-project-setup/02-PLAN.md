---
phase: 1
plan: 2
wave: 2
depends_on: [01-PLAN.md]
autonomous: true
files_modified:
  - src/cli/index.ts
  - src/config/index.ts
  - src/config/defaults.ts
  - src/config/types.ts
  - src/devices/index.ts
  - src/devices/registry.ts
  - src/devices/types.ts
  - src/engine/index.ts
  - src/engine/browser.ts
  - src/engine/capturer.ts
  - src/engine/types.ts
  - src/output/index.ts
  - src/output/organizer.ts
  - src/output/reporter.ts
  - src/output/types.ts
  - src/utils/logger.ts
  - src/utils/progress.ts
  - src/types/index.ts
  - src/index.ts
---

# Plan 2: Create Directory Structure and Skeleton Files

<objective>
Create the complete src/ directory structure with minimal skeleton files that export placeholder content, establishing the project architecture.
</objective>

<context>
The project configuration files exist from Plan 1. Now we need to create the directory structure matching the architecture design. Each file should have minimal content - just enough to establish the module and enable successful TypeScript compilation.

Required directory structure:
```
src/
  cli/index.ts           - CLI entry point
  config/index.ts        - Configuration loader exports
  config/defaults.ts     - Default values
  config/types.ts        - Config interfaces
  devices/index.ts       - Device registry exports
  devices/registry.ts    - Device lookup
  devices/types.ts       - Device interfaces
  engine/index.ts        - Screenshot engine facade
  engine/browser.ts      - Browser manager
  engine/capturer.ts     - Page capture
  engine/types.ts        - Engine interfaces
  output/index.ts        - Output manager facade
  output/organizer.ts    - File organization
  output/reporter.ts     - HTML report generator
  output/types.ts        - Output interfaces
  utils/logger.ts        - Console utilities
  utils/progress.ts      - Progress display
  types/index.ts         - Shared types
  index.ts               - Main entry
```
</context>

<tasks>
<task id="1">
Create src/types/index.ts with placeholder shared types:
```typescript
// Shared types for responsive-capture
export interface CaptureResult {
  success: boolean;
  deviceName: string;
  filepath?: string;
  error?: string;
}
```
</task>

<task id="2">
Create src/devices/types.ts with Device interface:
```typescript
export type DeviceCategory = 'phones' | 'tablets' | 'pc-laptops';

export interface Device {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  category: DeviceCategory;
  userAgent?: string;
}
```
Then create src/devices/registry.ts with placeholder getDevices function and src/devices/index.ts exporting from both.
</task>

<task id="3">
Create src/config/types.ts with Config interface, src/config/defaults.ts with default values, and src/config/index.ts exporting from both. Include basic config shape: outputDir, concurrency, timeout, waitBuffer.
</task>

<task id="4">
Create src/engine/types.ts with engine interfaces, src/engine/browser.ts with placeholder BrowserManager class, src/engine/capturer.ts with placeholder captureScreenshot function, and src/engine/index.ts exporting from all.
</task>

<task id="5">
Create src/output/types.ts with output interfaces, src/output/organizer.ts with placeholder organizeFiles function, src/output/reporter.ts with placeholder generateReport function, and src/output/index.ts exporting from all.
</task>

<task id="6">
Create src/utils/logger.ts with basic log/error functions and src/utils/progress.ts with placeholder progress utilities.
</task>

<task id="7">
Create src/index.ts that imports and re-exports main modules as the library entry point.
</task>

<task id="8">
Create src/cli/index.ts as the CLI entry point with:
- Basic Commander.js setup
- A simple console.log("responsive-capture CLI") placeholder
- Proper ESM import syntax
</task>
</tasks>

<verification>
- [ ] Directory structure exists: src/cli, src/config, src/devices, src/engine, src/output, src/utils, src/types
- [ ] All 18 .ts files exist with valid TypeScript content
- [ ] src/cli/index.ts imports commander and has basic program setup
- [ ] Each module's index.ts exports content from sibling files
- [ ] No TypeScript syntax errors in any file
</verification>

<must_haves>
- Project structure matches architecture: src/cli, src/engine, src/devices, src/output, src/utils, src/types, src/config
- src/cli/index.ts is the CLI entry point with Commander.js import
- All files contain valid TypeScript that can be parsed
- Module index files re-export from sibling implementation files
</must_haves>
