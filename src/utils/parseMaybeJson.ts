/**
 * Safely parse a value that may be a JSON string or already an object.
 * Returns null if the value is falsy or parsing fails.
 */
export const parseMaybeJson = <T,>(value: unknown): T | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') return value as T;
  return null;
};
