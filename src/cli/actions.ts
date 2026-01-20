import pc from 'picocolors';
import type { CLIOptions } from './types.js';
import {
  validateUrl,
  validateConcurrency,
  validateWait,
  selectDevices,
  resolvePages,
  buildFullUrl,
} from './validation.js';
import { BrowserManager, captureAllDevices } from '../engine/index.js';
import { createOutputDirectory, saveAllScreenshots } from '../output/index.js';
import { generateReport, prepareScreenshotsForReport } from '../output/reporter.js';
import { defaultConfig } from '../config/defaults.js';
import type { ReportData } from '../output/types.js';

/**
 * Main CLI action handler
 * Orchestrates: validation -> devices -> capture -> save -> report
 */
export async function runCapture(
  urlArg: string,
  pathArg: string | undefined,
  options: CLIOptions
): Promise<void> {
  const startTime = Date.now();

  // 1. Validate inputs (throws on invalid)
  const baseUrl = validateUrl(urlArg);
  const pages = resolvePages(pathArg, options.pages);
  const concurrency = validateConcurrency(options.concurrency);
  const waitBuffer = validateWait(options.wait);

  // 2. Select devices based on filters
  const devices = selectDevices(options);

  if (devices.length === 0) {
    throw new Error('No devices selected. Check your filter flags.');
  }

  console.log(pc.cyan(`\nCapturing ${devices.length} devices across ${pages.length} page(s)...`));
  console.log(pc.dim(`URL: ${baseUrl.href}`));
  console.log(pc.dim(`Pages: ${pages.join(', ')}`));
  console.log(pc.dim(`Concurrency: ${concurrency}`));

  // 3. Create output directory
  const outputDir = await createOutputDirectory({
    baseDir: options.output ?? defaultConfig.outputDir,
  });
  console.log(pc.dim(`Output: ${outputDir}`));

  // 4. Launch browser
  const manager = new BrowserManager();

  try {
    await manager.launch();

    // 5. Capture each page
    for (const page of pages) {
      const fullUrl = buildFullUrl(baseUrl, page);
      console.log(pc.cyan(`\nCapturing: ${fullUrl}`));

      const result = await captureAllDevices(
        manager,
        fullUrl,
        devices,
        {
          timeout: defaultConfig.timeout,
          waitBuffer,
        },
        {
          concurrency,
          onProgress: (done, total, res) => {
            const status = res.success ? pc.green('OK') : pc.red('FAIL');
            // Simple progress output (Phase 9 will add spinner)
            process.stdout.write(`\r  ${done}/${total} ${res.deviceName} ${status}  `);
          },
        }
      );

      // Clear progress line
      process.stdout.write('\r' + ' '.repeat(60) + '\r');

      console.log(pc.dim(`  ${result.successCount} succeeded, ${result.failureCount} failed`));

      // 6. Save screenshots
      const saveResult = await saveAllScreenshots(result.results, devices, outputDir);
      console.log(pc.dim(`  ${saveResult.savedCount} files saved`));

      // 7. Generate report
      const screenshots = prepareScreenshotsForReport(result.results, devices);
      const duration = Date.now() - startTime;

      const reportData: ReportData = {
        url: fullUrl,
        capturedAt: new Date().toLocaleString(),
        duration,
        deviceCount: result.successCount,
        files: [], // Files list populated by saveResult but not used in template
      };

      const reportPath = await generateReport(reportData, screenshots, outputDir);
      console.log(pc.green(`\nReport saved: ${reportPath}`));
    }

    const totalDuration = Date.now() - startTime;
    console.log(pc.green(`\nDone in ${Math.round(totalDuration / 1000)}s`));

  } finally {
    // Always cleanup browser
    await manager.close();
  }
}

/**
 * Handle CLI errors with appropriate exit codes
 */
export function handleError(error: unknown): never {
  if (error instanceof Error) {
    console.error(pc.red('\nError: ') + error.message);

    // Check for common error types
    if (error.message.includes('Invalid URL') || error.message.includes('Invalid protocol')) {
      console.error(pc.dim('\nHint: URL must start with http:// or https://'));
      process.exit(2); // Argument error
    }

    if (error.message.includes('Concurrency') || error.message.includes('Wait buffer')) {
      process.exit(2); // Argument error
    }

    // General error
    process.exit(1);
  }

  console.error(pc.red('\nUnknown error:'), error);
  process.exit(1);
}
