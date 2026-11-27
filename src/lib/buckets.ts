export type Filter = 'all' | 'short' | 'medium' | 'long';
export type Bucket = Exclude<Filter, 'all'>;

export const FILTERS: ReadonlyArray<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
];

/** Short is under a minute, medium runs to five minutes, long is anything past it. */
export function bucketOf(seconds: number): Bucket {
  if (seconds < 60) return 'short';
  if (seconds <= 300) return 'medium';
  return 'long';
}
