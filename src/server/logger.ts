export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message: msg, timestamp: new Date().toISOString(), ...meta }));
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', message: msg, timestamp: new Date().toISOString(), ...meta }));
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', message: msg, timestamp: new Date().toISOString(), ...meta }));
  },
};
