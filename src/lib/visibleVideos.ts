import { bucketOf, type Filter } from './buckets';

/** At most this many cards are rendered, so pasting a huge list stays bounded. */
export const MAX_CARDS = 30;

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
 * Under All everything shows; a bucket hides failures and unknown lengths by design.
 */
export function selectVisible({ links, durations, failures, filter, cap }: Input): VisibleVideos {
  const capped = links.slice(0, cap);

  const visible =
    filter === 'all'
      ? capped
      : capped.filter((url) => {
          if (failures[url]) return false;
          const seconds = durations[url];
          return seconds !== undefined && bucketOf(seconds) === filter;
        });

  return { visible, total: links.length, capped: links.length > cap };
}
