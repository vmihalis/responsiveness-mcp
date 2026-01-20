// CLI entry point for responsive-capture
// Note: shebang added via tsup banner config

import { program } from './commands.js';
import { runCapture, handleError } from './actions.js';
import type { CLIOptions } from './types.js';

// Connect action handler to program
program.action(async (url: string, path: string | undefined, options: CLIOptions) => {
  try {
    await runCapture(url, path, options);
  } catch (error) {
    handleError(error);
  }
});

// Parse arguments and run
program.parse();

// Re-exports for testing and programmatic use
export type { CLIOptions, ValidatedConfig } from './types.js';
export {
  validateUrl,
  validateConcurrency,
  validateWait,
  selectDevices,
  resolvePages,
  buildFullUrl,
  validateConfig,
} from './validation.js';
export { createProgram, program } from './commands.js';
export { runCapture, handleError } from './actions.js';
