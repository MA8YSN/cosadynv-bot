/**
 * utils/logger.ts
 * ─────────────────────────────────────────────────────────────────────────
 * A tiny leveled logger. It exists so that:
 *   1. Every log line is consistently formatted (timestamp + level + scope).
 *   2. We have exactly one place to swap in a real logging library
 *      (pino/winston) or ship logs to a dashboard later, without touching
 *      every file that currently calls console.log.
 *
 * Usage: `logger.info('Bot ready', 'Client')` -> "[12:00:00] INFO  (Client) Bot ready"
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

const COLORS: Record<LogLevel, string> = {
  info: '\x1b[36m', // cyan
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  success: '\x1b[32m', // green
  debug: '\x1b[90m', // gray
};

const RESET = '\x1b[0m';

function timestamp(): string {
  return new Date().toISOString().split('T')[1]?.split('.')[0] ?? '';
}

function log(level: LogLevel, message: string, scope?: string): void {
  const color = COLORS[level];
  const label = level.toUpperCase().padEnd(7);
  const scopeStr = scope ? `(${scope}) ` : '';
  // eslint-disable-next-line no-console
  console.log(`${color}[${timestamp()}] ${label}${RESET}${scopeStr}${message}`);
}

export const logger = {
  info: (message: string, scope?: string) => log('info', message, scope),
  warn: (message: string, scope?: string) => log('warn', message, scope),
  error: (message: string | Error, scope?: string) =>
    log('error', message instanceof Error ? (message.stack ?? message.message) : message, scope),
  success: (message: string, scope?: string) => log('success', message, scope),
  debug: (message: string, scope?: string) => {
    if (process.env.NODE_ENV !== 'production') log('debug', message, scope);
  },
};
