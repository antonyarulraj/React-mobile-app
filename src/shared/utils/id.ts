let counter = 0;

/** Generates a short, sequential, human-readable id — good enough for mock data with no backend. */
export function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}`;
}
