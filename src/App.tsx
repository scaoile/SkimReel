import { useCallback, useMemo, useState } from 'react';
import { CAP, SAMPLE_TEXT } from './lib/samples';
import { parseLinks } from './lib/parseLinks';
import { selectVisible } from './lib/visibleVideos';
import type { Filter } from './lib/buckets';
import { InputPanel } from './components/InputPanel';
import { FilterControl } from './components/FilterControl';
import { VideoGrid } from './components/VideoGrid';

export default function App() {
  const [links, setLinks] = useState<string[]>(() => parseLinks(SAMPLE_TEXT).links);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [failures, setFailures] = useState<Record<string, true>>({});
  const [filter, setFilter] = useState<Filter>('all');

  const handleMetadata = useCallback((url: string, seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    setDurations((previous) => (previous[url] === seconds ? previous : { ...previous, [url]: seconds }));
  }, []);

  const handleError = useCallback((url: string) => {
    setFailures((previous) => (previous[url] ? previous : { ...previous, [url]: true }));
  }, []);

  const handleLoad = useCallback((raw: string) => {
    const parsed = parseLinks(raw);
    setLinks(parsed.links);
    setDurations({});
    setFailures({});
    setFilter('all');
    return parsed;
  }, []);

  const selection = useMemo(
    () => selectVisible({ links, durations, failures, filter, cap: CAP }),
    [links, durations, failures, filter],
  );

  return (
    <div className="shell">
      <header className="masthead">
        <h1 className="masthead__title">SkimReel</h1>
        <p className="masthead__lead">
          Paste direct video links, one per line. Hover a card to play a muted preview at 2×; move
          away and it rewinds.
        </p>
      </header>

      <InputPanel initialText={SAMPLE_TEXT} onLoad={handleLoad} />

      <div className="controls">
        <FilterControl value={filter} onChange={setFilter} />
      </div>

      <VideoGrid
        selection={selection}
        filter={filter}
        durations={durations}
        failures={failures}
        onMetadata={handleMetadata}
        onError={handleError}
      />
    </div>
  );
}
