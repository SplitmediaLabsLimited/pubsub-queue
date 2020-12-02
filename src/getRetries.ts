export type RetryConfig = {
  count: number;
  delay?: number;
};

export const defaultRetries = {
  count: 0,
  delay: 1000,
};

export default function getRetries(
  retries?: RetryConfig | number
): RetryConfig {
  if (retries) {
    if (typeof retries === 'object' && retries.count) {
      return {
        ...defaultRetries,
        ...retries,
      };
    } else if (typeof retries === 'number') {
      return {
        ...defaultRetries,
        count: retries,
      };
    }
  }

  return defaultRetries;
}
