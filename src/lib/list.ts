// Accepts an array or a comma-separated string and returns trimmed, non-empty items.
export const splitList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
