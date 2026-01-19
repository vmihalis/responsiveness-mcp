# Architecture Research

## Components

### 1. CLI Parser (`cli/`)
**Responsibility**: Parse command-line arguments and validate input

- Accept URL (base URL like `http://localhost:3000`)
- Accept page path (e.g., `/dashboard`, `/settings`)
- Accept optional flags: output directory, concurrency limit, timeout
- Validate URL format and accessibility
- Return structured configuration object

**Technology**: Commander.js - mature, TypeScript-friendly, handles complex options

```
Input:  `responsive-check http://localhost:3000 /dashboard --output ./screenshots`
Output: { baseUrl, pagePath, outputDir, concurrency, timeout }
```

### 2. Device Registry (`devices/`)
**Responsibility**: Define and categorize device dimensions

- Store 50+ device presets with width, height, deviceScaleFactor, category
- Categories: `phones`, `tablets`, `pc-laptops`
- Provide device lookup by name or filter by category
- Support custom device definitions via config file

**Data structure**:
```typescript
interface Device {
  name: string;           // "iPhone 14 Pro"
  width: number;          // 393
  height: number;         // 852
  deviceScaleFactor: number; // 3
  category: 'phones' | 'tablets' | 'pc-laptops';
  userAgent?: string;     // Optional mobile UA
}
```

### 3. Screenshot Engine (`engine/`)
**Responsibility**: Orchestrate browser automation and capture screenshots

**Sub-components**:

#### 3a. Browser Manager
- Launch single Chromium instance (shared across all captures)
- Create isolated browser contexts per device (parallel-safe)
- Handle browser lifecycle (launch, health check, close)

#### 3b. Page Capturer
- Navigate to target URL
- Wait for network idle + configurable buffer (default 500ms)
- Capture full-page screenshot
- Handle timeout (default 30s max)
- Return screenshot buffer + metadata

#### 3c. Parallel Executor
- Accept list of devices and capture function
- Execute captures in parallel with concurrency limit (default: 10)
- Collect results and errors
- Report progress (for CLI feedback)

### 4. Output Manager (`output/`)
**Responsibility**: Organize screenshots and generate reports

#### 4a. File Organizer
- Create output directory structure: `output/{timestamp}/phones|tablets|pc-laptops/`
- Save screenshots with descriptive filenames: `{device-name}-{width}x{height}.png`
- Handle filesystem operations (mkdir, write)

#### 4b. Report Generator
- Generate single HTML file with embedded or linked images
- Grid layout for quick visual scanning
- Group by device category with collapsible sections
- Include metadata: URL, timestamp, device count, duration
- Self-contained (inline CSS, no external dependencies)

### 5. Configuration Loader (`config/`)
**Responsibility**: Merge CLI args with config file and defaults

- Load optional `.responsiverc.json` or `responsive.config.js`
- Merge priorities: CLI args > config file > defaults
- Validate final configuration
- Support custom device additions

---

## Data Flow

```
                                    [2. Device Registry]
                                           |
                                           | (device list)
                                           v
[User] --> [1. CLI Parser] --> [5. Config Loader] --> [3. Screenshot Engine]
               |                                              |
               | (args)                                       | (parallel captures)
               v                                              v
        { baseUrl,                                    [Browser Manager]
          pagePath,                                          |
          outputDir,                                         | (contexts)
          ... }                                              v
                                                      [Page Capturer] x N
                                                             |
                                                             | (screenshots + metadata)
                                                             v
                                                    [4. Output Manager]
                                                             |
                                        +--------------------+--------------------+
                                        |                                         |
                                        v                                         v
                                 [File Organizer]                        [Report Generator]
                                        |                                         |
                                        v                                         v
                              phones/tablet/pc-laptops/                    report.html
                                   *.png files
```

### Sequence Flow

1. **CLI invocation**: User runs `responsive-check <url> <path> [options]`
2. **Argument parsing**: CLI Parser validates and structures input
3. **Configuration merge**: Config Loader combines CLI + file + defaults
4. **Device selection**: Device Registry provides filtered device list
5. **Browser launch**: Browser Manager starts single Chromium instance
6. **Parallel capture**: For each device (limited concurrency):
   - Create browser context with device viewport
   - Navigate to URL + path
   - Wait for network idle + buffer
   - Capture full-page screenshot
   - Close context
7. **Output organization**: File Organizer creates directories and saves PNGs
8. **Report generation**: Report Generator creates HTML with all screenshots
9. **Cleanup**: Browser Manager closes Chromium
10. **Summary**: CLI displays results (count, duration, report path)

---

## Build Order

Based on dependencies, build components in this sequence:

### Phase 1: Foundation (No dependencies)
1. **Device Registry** - Pure data, no external dependencies
   - Define device data structure
   - Create initial 50+ device presets
   - Implement category filtering

2. **Configuration types** - TypeScript interfaces only
   - Define all config interfaces
   - Define result/error types

### Phase 2: Core Engine (Depends on Phase 1)
3. **Browser Manager** - Playwright wrapper
   - Launch/close browser
   - Create/destroy contexts
   - Health check utilities

4. **Page Capturer** - Uses Browser Manager
   - Navigation with wait strategies
   - Full-page screenshot capture
   - Timeout handling

### Phase 3: Orchestration (Depends on Phase 2)
5. **Parallel Executor** - Uses Page Capturer
   - Concurrency-limited execution
   - Progress reporting
   - Error collection

6. **Screenshot Engine facade** - Combines 3a, 3b, 3c
   - Single entry point for capture operations
   - Coordinates browser lifecycle with captures

### Phase 4: Output (Depends on Phase 3)
7. **File Organizer** - Filesystem operations
   - Directory creation
   - Screenshot saving with naming convention

8. **Report Generator** - HTML generation
   - Template with embedded CSS
   - Image grid layout
   - Metadata display

### Phase 5: Interface (Depends on all above)
9. **Configuration Loader** - Merge logic
   - File loading (JSON/JS config)
   - Merge with defaults
   - Validation

10. **CLI Parser** - User interface
    - Commander.js setup
    - Argument definitions
    - Help text
    - Main execution flow

### Phase 6: Integration
11. **Main entry point** - Wire everything together
    - CLI -> Config -> Engine -> Output
    - Error handling
    - Exit codes

---

## File Structure

```
responsiveness-mcp/
├── src/
│   ├── cli/
│   │   ├── index.ts           # CLI entry point, Commander setup
│   │   ├── arguments.ts       # Argument definitions and parsing
│   │   └── validators.ts      # URL and path validation
│   │
│   ├── config/
│   │   ├── index.ts           # Configuration loader
│   │   ├── defaults.ts        # Default configuration values
│   │   ├── schema.ts          # Validation schema
│   │   └── types.ts           # Configuration interfaces
│   │
│   ├── devices/
│   │   ├── index.ts           # Device registry exports
│   │   ├── registry.ts        # Device lookup and filtering
│   │   ├── presets/
│   │   │   ├── phones.ts      # Phone device definitions
│   │   │   ├── tablets.ts     # Tablet device definitions
│   │   │   └── pc-laptops.ts  # Desktop/laptop definitions
│   │   └── types.ts           # Device interfaces
│   │
│   ├── engine/
│   │   ├── index.ts           # Screenshot engine facade
│   │   ├── browser.ts         # Browser manager (launch, context)
│   │   ├── capturer.ts        # Page capture logic
│   │   ├── executor.ts        # Parallel execution coordinator
│   │   └── types.ts           # Engine interfaces
│   │
│   ├── output/
│   │   ├── index.ts           # Output manager facade
│   │   ├── organizer.ts       # File organization logic
│   │   ├── reporter.ts        # HTML report generator
│   │   ├── templates/
│   │   │   └── report.html    # HTML template (or inline)
│   │   └── types.ts           # Output interfaces
│   │
│   ├── utils/
│   │   ├── logger.ts          # Console output utilities
│   │   ├── progress.ts        # Progress bar/spinner
│   │   └── timing.ts          # Duration formatting
│   │
│   ├── types/
│   │   └── index.ts           # Shared type exports
│   │
│   └── index.ts               # Main entry, wires components
│
├── bin/
│   └── responsive-check.ts    # CLI executable entry
│
├── tests/
│   ├── unit/
│   │   ├── devices/
│   │   ├── config/
│   │   └── output/
│   └── integration/
│       └── engine/
│
├── package.json
├── tsconfig.json
├── .responsiverc.json.example # Example config file
└── README.md
```

---

## Key Architectural Decisions

### Single Browser, Multiple Contexts
- Launch ONE Chromium instance for all captures
- Create isolated browser context per device (lightweight)
- Contexts are independent, parallel-safe, share browser resources
- Significantly faster than launching browser per device

### Parallel with Concurrency Limit
- Default concurrency: 10 simultaneous captures
- Prevents resource exhaustion on machines with limited RAM
- Configurable via CLI flag for power users
- Uses `p-limit` or similar for controlled parallelism

### Full-Page Screenshots
- Capture entire scrollable page, not just viewport
- Catches layout issues below the fold
- Larger file sizes but complete coverage
- Playwright handles scroll-stitching automatically

### Self-Contained HTML Report
- Single file output, no external dependencies
- Inline CSS, images as data URLs or relative paths
- Can be shared/archived easily
- Opens directly in any browser

### Typed Throughout
- TypeScript for all components
- Strict mode enabled
- Interfaces define component contracts
- Makes refactoring safe, enables IDE support

---

## External Dependencies

| Package | Purpose | Why This One |
|---------|---------|--------------|
| `playwright` | Browser automation | Best device emulation, built-in Chrome, active maintenance |
| `commander` | CLI parsing | Industry standard, excellent TypeScript support |
| `p-limit` | Concurrency control | Simple, lightweight, well-tested |
| `ora` | Progress spinner | Clean CLI feedback during captures |
| `chalk` | Terminal colors | Readable CLI output |

---

## Performance Considerations

### Target: 50+ screenshots in under 60 seconds

**Strategies**:
1. Single browser launch (~2s) vs per-device (~100s for 50 devices)
2. Parallel context creation (10 concurrent = 5 batches for 50 devices)
3. Network idle wait prevents premature captures
4. Reuse page within context where possible
5. PNG compression balance (quality vs file size)

**Bottlenecks to watch**:
- Initial browser launch (cold start)
- Slow-loading pages (network bound)
- Large full-page screenshots (memory bound)
- Filesystem writes (I/O bound, mitigated by parallel)
