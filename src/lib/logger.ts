/**
 * Centralized Logging Service
 * Handles log formatting and structured logging with correlation IDs
 */

const generateCorrelationId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const formatStructuredLog = (level: string, message: string, context?: Record<string, unknown>, error?: Error | unknown) => {
  const isDev = import.meta.env ? import.meta.env.DEV : process.env.NODE_ENV !== 'production';
  
  const logPayload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    correlationId: context?.correlationId || generateCorrelationId()
  };

  if (error && error instanceof Error) {
    logPayload['error_name'] = error.name;
    logPayload['error_message'] = error.message;
    logPayload['error_stack'] = error.stack;
  } else if (error) {
    logPayload['error_detail'] = String(error);
  }

  if (isDev) {
    // Human readable in dev
    const consoleMethod = level === 'ERROR' ? console.error : (level === 'WARN' ? console.warn : console.info);
    consoleMethod(`[${level}] ${message}`, Object.keys(context || {}).length > 0 ? context : "", error || "");
  } else {
    // Structured JSON for production monitoring (Google Cloud Logging, Datadog, etc)
    const consoleMethod = level === 'ERROR' ? console.error : (level === 'WARN' ? console.warn : console.log);
    consoleMethod(JSON.stringify(logPayload));
  }
};

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    formatStructuredLog('INFO', message, context);
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    formatStructuredLog('WARN', message, context);
  },
  error: (error: Error | string | unknown, context?: Record<string, unknown>) => {
    const message = typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Unknown error');
    formatStructuredLog('ERROR', message, context, error);
  },
};

/**
 * Retry utility for network requests
 */
export const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    logger.warn(`Operation failed, retrying in ${delay}ms...`, { retriesLeft: retries, delay });
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
  }
};
