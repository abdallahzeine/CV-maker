const DEBUG = import.meta.env.VITE_CV_DEBUG === 'true';

type LogLevel = 'info' | 'warn' | 'error' | 'patch' | 'store';

const LOG_PREFIXES: Record<LogLevel, string> = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  patch: '📝',
  store: '🏪',
};

function formatMessage(level: LogLevel, ...args: unknown[]): string {
  const prefix = LOG_PREFIXES[level];
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${prefix} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`;
}

export const cvDebug = {
  info: (...args: unknown[]) => {
    if (DEBUG) console.info(formatMessage('info', ...args));
  },
  warn: (...args: unknown[]) => {
    if (DEBUG) console.warn(formatMessage('warn', ...args));
  },
  error: (...args: unknown[]) => {
    if (DEBUG) console.error(formatMessage('error', ...args));
  },
  patch: (op: string, path: string, value?: unknown) => {
    if (DEBUG) console.info(formatMessage('patch', op, path, value !== undefined ? JSON.stringify(value) : ''));
  },
  store: (action: string, state?: unknown) => {
    if (DEBUG) console.info(formatMessage('store', action, state !== undefined ? JSON.stringify(state) : ''));
  },
};
