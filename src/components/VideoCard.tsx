import { useRef, useState } from 'react';
import { fileNameOf, formatDuration, hostOf } from '../lib/format';

type Props = {
  url: string;
  duration: number | undefined;
  failed: boolean;
  onMetadata: (url: string, seconds: number) => void;
  onError: (url: string) => void;
};

export function VideoCard({ url, duration, failed, onMetadata, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasFrame, setHasFrame] = useState(false);
  const name = fileNameOf(url);
  const host = hostOf(url);

  const start = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!startedRef.current) {
      startedRef.current = true;
      try {
        // The still frame sits a little way in, so a preview always begins at zero.
        video.currentTime = 0;
      } catch {
        // Nothing to rewind yet.
      }
    }
    video.playbackRate = 2;
    video.muted = true;
    const attempt = video.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      setPlaying(true);
    }
  };

  const pause = () => {
    videoRef.current?.pause();
    setPlaying(false);
  };

  const rewind = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    startedRef.current = false;
    setPlaying(false);
    setProgress(0);
  };

  const toggle = () => {
    if (playing) pause();
    else start();
  };

  const handlePointerOver = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    // Ignore moves between the frame, the rail and the cue inside one card.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    start();
  };

  const handlePointerOut = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    rewind();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    toggle();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle();
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      onMetadata(url, video.duration);
    }
    try {
      // Frame zero is often a black or white fade. Two seconds in is more telling.
      const poster = Number.isFinite(video.duration)
        ? Math.min(2, Math.max(0.1, video.duration * 0.1))
        : 0.1;
      video.currentTime = poster;
    } catch {
      // Seeking before the file has a seekable range is a no-op, not a failure.
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress(video.currentTime / video.duration);
  };

  if (failed) {
    return (
      <article className="card card--failed">
        <div className="card__frame card__frame--failed">
          <p className="card__failed-label">Failed to load</p>
        </div>
        <p className="card__url">{url}</p>
      </article>
    );
  }

  return (
    <article className="card">
      <div
        className="card__target"
        role="button"
        tabIndex={0}
        aria-pressed={playing}
        aria-label={`Preview ${name}`}
        data-playing={playing}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <div className="card__frame">
          <video
            ref={videoRef}
            className={hasFrame ? 'card__video card__video--ready' : 'card__video'}
            src={url}
            preload="metadata"
            muted
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={() => setHasFrame(true)}
            onError={() => onError(url)}
            onTimeUpdate={handleTimeUpdate}
          />
          {duration === undefined ? <span className="card__badge">Loading</span> : null}
          <span className="card__cue" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" focusable="false">
              <path d="M8 4.8v14.4L19.5 12z" fill="currentColor" />
            </svg>
          </span>
        </div>
        <span className="card__rail" aria-hidden="true">
          <span className="card__rail-fill" style={{ transform: `scaleX(${progress})` }} />
        </span>
      </div>
      <div className="card__meta">
        <p className="card__line">
          <span className="card__name" title={url}>
            {name}
          </span>
          <span className="card__time">
            {duration === undefined ? null : formatDuration(duration)}
          </span>
        </p>
        <p className="card__host">{host}</p>
      </div>
    </article>
  );
}
