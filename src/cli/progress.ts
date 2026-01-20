import ora, { type Ora } from 'ora';
import pc from 'picocolors';

/**
 * Progress spinner for capture operations.
 * Wraps ora with methods tailored to screenshot capture workflow.
 */
export interface ProgressSpinner {
  /** Start spinner with initial message */
  start(total: number): void;
  /** Update progress with device name and status */
  update(completed: number, total: number, deviceName: string, success: boolean): void;
  /** Complete with success (all succeeded) */
  succeed(count: number): void;
  /** Complete with warning (some failed) */
  warn(succeeded: number, failed: number): void;
  /** Stop spinner (for cleanup) */
  stop(): void;
  /** Check if spinner is currently active */
  isSpinning: boolean;
}

/**
 * Create a progress spinner for capture operations.
 * Automatically handles non-TTY environments (disables animation).
 */
export function createSpinner(): ProgressSpinner {
  let spinner: Ora | null = null;

  return {
    start(total: number): void {
      spinner = ora({
        text: `Starting capture of ${total} devices...`,
        color: 'cyan',
        spinner: 'dots',
      }).start();
    },

    update(completed: number, total: number, deviceName: string, success: boolean): void {
      if (!spinner) return;
      const status = success ? pc.green('OK') : pc.red('FAIL');
      spinner.text = `Capturing ${completed}/${total}: ${deviceName} ${status}`;
    },

    succeed(count: number): void {
      if (!spinner) return;
      spinner.succeed(pc.green(`Captured ${count} devices successfully`));
      spinner = null;
    },

    warn(succeeded: number, failed: number): void {
      if (!spinner) return;
      spinner.stopAndPersist({
        symbol: pc.yellow('!'),
        text: `Captured ${succeeded} devices (${pc.red(`${failed} failed`)})`,
      });
      spinner = null;
    },

    stop(): void {
      if (spinner) {
        spinner.stop();
        spinner = null;
      }
    },

    get isSpinning(): boolean {
      return spinner?.isSpinning ?? false;
    },
  };
}
