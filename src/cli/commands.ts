import { Command } from 'commander';

/**
 * Create Commander program with all CLI arguments and options
 * Separated from action handler for testability
 */
export function createProgram(): Command {
  const program = new Command()
    .name('screenie')
    .description('Capture responsive screenshots across 50+ device viewports')
    .version('1.0.0')

    // Required: base URL
    .argument('<url>', 'Base URL to capture (e.g., http://localhost:3000)')

    // Optional: single page path
    .argument('[path]', 'Page path to capture (default: /)')

    // Multiple pages (variadic, must be after other options in usage)
    .option('--pages <paths...>', 'Multiple page paths to capture')

    // Execution options
    .option(
      '-c, --concurrency <number>',
      'Number of parallel captures (1-50)',
      parseInt
    )
    .option(
      '-w, --wait <ms>',
      'Wait buffer after page load in milliseconds',
      parseInt
    )

    // Device filters (can combine for union)
    .option('--phones-only', 'Only capture phone devices')
    .option('--tablets-only', 'Only capture tablet devices')
    .option('--desktops-only', 'Only capture desktop/laptop devices')

    // Output
    .option('-o, --output <dir>', 'Output directory (default: ./screenshots)')

    // Browser auto-open control
    .option('--no-open', 'Suppress auto-opening report in browser')

    // Help examples
    .addHelpText(
      'after',
      `
Examples:
  $ screenie http://localhost:3000
  $ screenie http://localhost:3000 /about
  $ screenie https://example.com --pages /home /about /contact
  $ screenie http://localhost:3000 --phones-only --concurrency 5
  $ screenie http://localhost:3000 --wait 1000 --output ./my-screenshots
  $ screenie http://localhost:3000 --no-open  # CI mode, don't open browser
`
    );

  return program;
}

/**
 * Default program instance
 * Will be connected to action handler in index.ts
 */
export const program = createProgram();
