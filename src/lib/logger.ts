/**
 * Centralized Logging Service
 * Handles log formatting and structured logging
 */
export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[INFO] ${message}`, context || "");
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, context || "");
  },
  error: (error: Error | string, context?: Record<string, unknown>) => {
    console.error(`[ERROR]`, error, context || "");
  },
};

/**
 * Retry utility for network requests
 * @param fn Function returning a promise to retry
 * @param retries Maximum number of retries
 * @param delay Delay between retries in milliseconds
 */
export const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    logger.warn(`Operation failed, retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
  }
};
