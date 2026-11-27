import { bucketOf, type Filter } from './buckets';

export type VisibleVideos = {
  visible: string[];
  total: number;
  capped: boolean;
};

type Input = {
  links: string[];
  durations: Record<string, number>;
  failures: Record<string, true>;
  filter: Filter;
  cap: number;
};

/**
 * The cap is applied before the filter, because only rendered cards load metadata.
 * Filtering the unrendered tail would put videos in buckets we cannot vouch for.
 */
export function selectVisible({ links, durations, failures, filter, cap }: Input): VisibleVideos {
  const capped = links.slice(0, cap);

  const visible = capped.filter((url) => {
    if (failures[url]) return filter === 'all';
    const seconds = durations[url];
    if (seconds === undefined) return filter === 'all';
    return filter === 'all' || bucketOf(seconds) === filter;
  });

  return { visible, total: links.length, capped: links.length > cap };
}
