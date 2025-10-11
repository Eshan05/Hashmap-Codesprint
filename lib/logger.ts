
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const log = (level: LogLevel, ...args: unknown[]) => {
  const message = `${level.toUpperCase()}: ${args
    .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
    .join(' ')}`;

  if (level === 'info' || level === 'warn' || level === 'error') {
    console[level](message);
  }
};

export const logger = {
  debug: (...args: unknown[]) => {
    log('debug', ...args);
  },
  info: (...args: unknown[]) => {
    log('info', ...args);
  },
  warn: (...args: unknown[]) => {
    log('warn', ...args);
  },
  error: (...args: unknown[]) => {
    log('error', ...args);
  },
};