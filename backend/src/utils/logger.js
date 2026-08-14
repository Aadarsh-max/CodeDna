const timestamp = () => new Date().toISOString();

export const logger = {
  info: (message) => console.log(`[INFO] ${timestamp()} - ${message}`),
  warn: (message) => console.warn(`[WARN] ${timestamp()} - ${message}`),
  error: (message) => console.error(`[ERROR] ${timestamp()} - ${message}`),
};