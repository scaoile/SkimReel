/** Parses a link, or returns null instead of throwing on anything that is not a URL. */
export function tryUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}
