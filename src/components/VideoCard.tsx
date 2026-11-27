import { useEffect, useRef, useState } from 'react';
import { fileNameOf, formatDuration, hostOf } from '../lib/format';

type Props = {
  url: string;
  duration: number | undefined;
  failed: boolean;
  onMetadata: (url: string, seconds: number) => void;
  onError: (url: string) => void;
};

/** True only when a mouse pointer crosses the card's edge, not when it moves inside. */
function crossesMouseEdge(event: React.PointerEvent<HTMLDivElement>): boolean {
  if (event.pointerType !== 'mouse') return false;
  return !event.currentTarget.contains(event.relatedTarget as Node | null);
}

const SPEAKER = 'M4 9.2h3.1L11.6 5.6v12.8L7.1 14.8H4z';

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d={SPEAKER} fill="currentColor" />
      <path
        d="M15 9.2a4.6 4.6 0 0 1 0 5.6M17.7 6.6a8.4 8.4 0 0 1 0 10.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d={SPEAKER} fill="currentColor" />
      <path
        d="M15.4 9.6l4.8 4.8m0-4.8l-4.8 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VideoCard({ url, duration, failed, onMetadata, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // True until the first play has put the preview back at zero, because the still frame sits partway in.
  const firstPlayPending = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasFrame, setHasFrame] = useState(false);
  const [muted, setMuted] = useState(true);
  const name = fileNameOf(url);
  const host = hostOf(url);

  useEffect(() => {
    // Captured at mount: React has already cleared the ref when this cleanup runs.
    const video = videoRef.current;
    return () => {
      video?.pause();
    };
  }, []);

  const start = () => {
    const video = videoRef.current;
    if (!video) return;
    if (firstPlayPending.current) {
      firstPlayPending.current = false;
      try {
        video.currentTime = 0;
      } catch {
        // Nothing to rewind yet.
      }
    }
    video.playbackRate = 2;
    video.muted = muted;
    video
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
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
    firstPlayPending.current = true;
    setPlaying(false);
    setProgress(0);
  };

  const toggle = () => {
    if (playing) pause();
    else start();
  };

  const toggleSound = () => {
    const video = videoRef.current;
    const next = !muted;
    setMuted(next);
    if (video) video.muted = next;
  };

  const handlePointerOver = (event: React.PointerEvent<HTMLDivElement>) => {
    if (crossesMouseEdge(event)) start();
  };

  const handlePointerOut = (event: React.PointerEvent<HTMLDivElement>) => {
    if (crossesMouseEdge(event)) rewind();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    // The tap path is touch-only: a pen must never preview.
    if (event.pointerType !== 'touch') return;
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
    onMetadata(url, video.duration);
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
        className="card__stage"
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <div
          className="card__frame"
          role="button"
          tabIndex={0}
          aria-pressed={playing}
          aria-label={`Preview ${name}`}
          data-playing={playing}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
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
          <span className="card__cue" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" focusable="false">
              <path d="M8 4.8v14.4L19.5 12z" fill="currentColor" />
            </svg>
          </span>
        </div>

        {duration === undefined ? <span className="card__badge">Loading</span> : null}

        <button
          type="button"
          className="card__sound"
          aria-pressed={!muted}
          aria-label={`Sound for ${name}`}
          title={muted ? 'Turn sound on' : 'Turn sound off'}
          onClick={toggleSound}
        >
          {muted ? <SpeakerOff /> : <SpeakerOn />}
        </button>
      </div>

      <div className="card__rail-row">
        <span className="card__rail" aria-hidden="true">
          <span className="card__rail-fill" style={{ transform: `scaleX(${progress})` }} />
        </span>
        {duration === undefined ? null : <span className="card__time">{formatDuration(duration)}</span>}
      </div>

      <div className="card__meta">
        <p className="card__name" title={url}>
          {name}
        </p>
        <p className="card__host">{host}</p>
      </div>
    </article>
  );
}
