import { CAP } from '../lib/samples';
import { FILTERS, type Filter } from '../lib/buckets';
import type { VisibleVideos } from '../lib/visibleVideos';
import { VideoCard } from './VideoCard';

type Props = {
  selection: VisibleVideos;
  filter: Filter;
  durations: Record<string, number>;
  failures: Record<string, true>;
  onMetadata: (url: string, seconds: number) => void;
  onError: (url: string) => void;
};

export function VideoGrid({ selection, filter, durations, failures, onMetadata, onError }: Props) {
  const { visible, total, capped } = selection;
  const filterLabel = FILTERS.find((option) => option.id === filter)?.label ?? 'All';
  const empty = visible.length === 0;

  return (
    <section className="grid-region" aria-label="Videos">
      {capped ? (
        <p className="grid__notice">
          Showing first {CAP} of {total} links.
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
              key={url}
              url={url}
              duration={durations[url]}
              failed={Boolean(failures[url])}
              onMetadata={onMetadata}
              onError={onError}
            />
          ))}
        </div>
      )}
    </section>
  );
}
