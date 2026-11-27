import { FILTERS, type Filter } from '../lib/buckets';
import { MAX_CARDS, type VisibleVideos } from '../lib/visibleVideos';
import { youTubeIdOf } from '../lib/youtube';
import { VideoCard } from './VideoCard';

type Props = {
  selection: VisibleVideos;
  filter: Filter;
  /** Bumped by the shell on every Load; part of the card key, so cards remount. */
  generation: number;
  durations: Record<string, number>;
  failures: Record<string, true>;
  onMetadata: (url: string, seconds: number) => void;
  onError: (url: string) => void;
  onOpen: (url: string) => void;
};

export function VideoGrid({
  selection,
  filter,
  generation,
  durations,
  failures,
  onMetadata,
  onError,
  onOpen,
}: Props) {
  const { visible, total, capped } = selection;
  const filterLabel = FILTERS.find((option) => option.id === filter)?.label ?? 'All';
  const empty = visible.length === 0;

  return (
    <section className="grid-region" aria-label="Videos">
      {capped ? (
        <p className="grid__notice">
          Showing first {MAX_CARDS} of {total} links.
        </p>
      ) : null}

      {empty ? (
        total === 0 ? (
          <p className="grid__empty">
            <span className="grid__empty-lead">No videos loaded.</span>
            Paste one https link per line, then press Load videos.
          </p>
        ) : (
          <p className="grid__empty">
            <span className="grid__empty-lead">Nothing in {filterLabel}.</span>
            Try All to see every clip.
          </p>
        )
      ) : (
        <div className="grid">
          {visible.map((url) => (
            <VideoCard
              key={`${generation}:${url}`}
              url={url}
              duration={durations[url]}
              failed={Boolean(failures[url])}
              youTubeId={youTubeIdOf(url) ?? undefined}
              onMetadata={onMetadata}
              onError={onError}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </section>
  );
}
