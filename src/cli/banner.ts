import figlet from 'figlet';
import pc from 'picocolors';

/**
 * Get terminal width from available sources
 * Priority: process.stdout.columns > COLUMNS env var > default 80
 */
function getTerminalWidth(): number {
  // Primary source: stdout columns
  if (process.stdout.columns !== undefined && process.stdout.columns > 0) {
    return process.stdout.columns;
  }

  // Fallback: COLUMNS environment variable
  const envColumns = process.env.COLUMNS;
  if (envColumns !== undefined) {
    const parsed = parseInt(envColumns, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // Default to 80 columns
  return 80;
}

/**
 * Select appropriate figlet font based on terminal width
 * Returns null for plain text fallback
 */
function selectFont(width: number): 'Big' | 'Small' | 'Mini' | null {
  if (width >= 80) {
    return 'Big'; // Full size (63 chars wide)
  }
  if (width >= 60) {
    return 'Small'; // Medium size (43 chars wide)
  }
  if (width >= 45) {
    return 'Mini'; // Compact size (30 chars wide)
  }
  return null; // Plain text for very narrow terminals
}

/**
 * Generate plain text banner for narrow terminals or non-TTY output
 */
function generatePlainBanner(version: string): string {
  return [
    'SCREENIE',
    `v${version}`,
    'Capture responsive screenshots across 57 device viewports',
    'Run: screenie --help',
    '',
  ].join('\n');
}

/**
 * Generate ASCII art banner for CLI branding
 * Displays on --version and -v flags
 *
 * Automatically detects terminal width and selects appropriate font:
 * - >= 80 columns: Big font (full ASCII art)
 * - 60-79 columns: Small font (narrower ASCII art)
 * - 45-59 columns: Mini font (compact ASCII art)
 * - < 45 columns or non-TTY: Plain text fallback
 */
export function generateBanner(version: string): string {
  // Non-TTY output (pipes, CI) gets plain text
  if (!process.stdout.isTTY) {
    return generatePlainBanner(version);
  }

  // Get terminal width and select font
  const width = getTerminalWidth();
  const font = selectFont(width);

  // Very narrow terminals get plain text
  if (font === null) {
    return generatePlainBanner(version);
  }

  // Generate ASCII art logo using figlet with selected font
  const asciiLogo = figlet.textSync('SCREENIE', {
    font: font,
    horizontalLayout: 'fitted',
    width: width,
  });

  // Format each component
  const coloredLogo = pc.cyan(asciiLogo);
  const versionLine = pc.dim(`  v${version}`);
  const tagline = pc.dim(
    '  Capture responsive screenshots across 57 device viewports'
  );
  const quickStart = pc.dim('  Run: screenie --help');

  // Combine all parts with proper spacing
  return [coloredLogo, '', versionLine, tagline, quickStart, ''].join('\n');
}
