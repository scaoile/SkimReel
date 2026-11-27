import { tryUrl } from './url';

export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

export function hostOf(url: string): string {
  return tryUrl(url)?.hostname.replace(/^www\./, '') ?? '';
}

export function fileNameOf(url: string): string {
  const parsed = tryUrl(url);
  if (!parsed) return url;
  const last = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
  return decodeSegment(last) || parsed.hostname;
}

/** A file name is worth showing decoded, but a stray `%` must not break the grid. */
function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
