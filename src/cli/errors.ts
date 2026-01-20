import pc from 'picocolors';
import type { ExecutionResult } from '../engine/types.js';

/**
 * Error types for categorization
 */
export type ErrorType = 'dns' | 'ssl' | 'connection' | 'timeout' | 'http' | 'url' | 'unknown';

/**
 * Formatted error with user-friendly message and optional hint
 */
export interface FormattedError {
  type: ErrorType;
  message: string;
  hint?: string;
}

/**
 * Format a capture error into a user-friendly message with actionable hint.
 *
 * Categorizes common Playwright/network errors and provides clear explanations.
 *
 * @param error - Error message string from capture attempt
 * @returns FormattedError with type, message, and optional hint
 *
 * @example
 * formatCaptureError('net::ERR_NAME_NOT_RESOLVED')
 * // { type: 'dns', message: 'Domain not found', hint: 'Check that the URL is spelled correctly' }
 */
export function formatCaptureError(error: string): FormattedError {
  const lower = error.toLowerCase();

  // DNS errors
  if (lower.includes('err_name_not_resolved')) {
    return {
      type: 'dns',
      message: 'Domain not found',
      hint: 'Check that the URL is spelled correctly',
    };
  }

  // SSL certificate errors
  if (lower.includes('err_cert_')) {
    return {
      type: 'ssl',
      message: 'SSL certificate error',
      hint: 'The site may have an invalid or expired certificate',
    };
  }

  // Connection refused
  if (lower.includes('err_connection_refused')) {
    return {
      type: 'connection',
      message: 'Connection refused',
      hint: 'The server may be down or not accepting connections',
    };
  }

  // Connection timeout/reset
  if (lower.includes('err_connection_timed_out') || lower.includes('err_connection_reset')) {
    return {
      type: 'connection',
      message: 'Connection failed',
      hint: 'Network issue or server unresponsive',
    };
  }

  // Timeout errors
  if (lower.includes('timeout') || lower.includes('exceeded')) {
    return {
      type: 'timeout',
      message: 'Page load timed out',
      hint: 'Try increasing --wait or check if page has heavy resources',
    };
  }

  // HTTP 404
  if (lower.includes('404') || lower.includes('not found')) {
    return {
      type: 'http',
      message: 'Page not found (404)',
      hint: 'Check that the URL path is correct',
    };
  }

  // HTTP 403
  if (lower.includes('403') || lower.includes('forbidden')) {
    return {
      type: 'http',
      message: 'Access forbidden (403)',
      hint: 'The server is blocking access to this page',
    };
  }

  // HTTP 401
  if (lower.includes('401') || lower.includes('unauthorized')) {
    return {
      type: 'http',
      message: 'Authentication required (401)',
      hint: 'This page requires login credentials',
    };
  }

  // Invalid URL
  if (lower.includes('invalid url') || lower.includes('invalid protocol')) {
    return {
      type: 'url',
      message: 'Invalid URL',
      hint: 'URL must start with http:// or https://',
    };
  }

  // Unknown errors - truncate if too long
  return {
    type: 'unknown',
    message: error.length > 60 ? error.slice(0, 57) + '...' : error,
    hint: undefined,
  };
}

/**
 * Display a single failure with formatted error
 */
function displayFailure(deviceName: string, error: string): void {
  const formatted = formatCaptureError(error);
  const symbol = pc.red('x');
  const device = pc.bold(deviceName);

  console.log(`  ${symbol} ${device}: ${formatted.message}`);

  if (formatted.hint) {
    console.log(pc.dim(`    Hint: ${formatted.hint}`));
  }
}

/**
 * Display summary of capture failures with formatted errors.
 *
 * Shows each failed device with user-friendly error message and hint.
 * Only displays failures, not successes.
 *
 * @param results - Array of execution results
 *
 * @example
 * displayFailureSummary(results);
 * // Output:
 * // Failures:
 * //   x iPhone 14 Pro: Domain not found
 * //     Hint: Check that the URL is spelled correctly
 */
export function displayFailureSummary(results: ExecutionResult[]): void {
  const failures = results.filter(r => !r.success);

  if (failures.length === 0) {
    return;
  }

  console.log('');
  console.log(pc.bold('Failures:'));

  for (const failure of failures) {
    displayFailure(failure.deviceName, failure.error ?? 'Unknown error');
  }
}

/**
 * Display final capture summary with counts.
 *
 * @param successCount - Number of successful captures
 * @param failureCount - Number of failed captures
 */
export function displayCaptureSummary(successCount: number, failureCount: number): void {
  console.log('');

  if (failureCount === 0) {
    console.log(pc.green(`All ${successCount} captures completed successfully`));
    return;
  }

  console.log(pc.bold('Summary:'));
  console.log(`  ${pc.green('Succeeded:')} ${successCount}`);
  console.log(`  ${pc.red('Failed:')} ${failureCount}`);
}
