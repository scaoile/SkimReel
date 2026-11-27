import { tryUrl } from './url';

export type ParseResult = {
  links: string[];
  skipped: number;
  duplicates: number;
};

function isHttpLink(line: string): boolean {
  const protocol = tryUrl(line)?.protocol;
  return protocol === 'http:' || protocol === 'https:';
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
