export type ParseResult = {
  links: string[];
  skipped: number;
  duplicates: number;
};

function isHttpLink(line: string): boolean {
  try {
    const { protocol } = new URL(line);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export function parseLinks(raw: string): ParseResult {
  const seen = new Set<string>();
  const links: string[] = [];
  let skipped = 0;
  let duplicates = 0;

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!isHttpLink(trimmed)) {
      skipped += 1;
      continue;
    }
    if (seen.has(trimmed)) {
      duplicates += 1;
      continue;
    }
    seen.add(trimmed);
    links.push(trimmed);
  }

  return { links, skipped, duplicates };
}
