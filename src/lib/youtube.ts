const ID = /^[A-Za-z0-9_-]{11}$/;

function isId(candidate: string | null | undefined): candidate is string {
  return typeof candidate === 'string' && ID.test(candidate);
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com']);

/** The video id for a YouTube watch, share, shorts, live or embed link, otherwise null. */
export function youTubeIdOf(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const [first] = parsed.pathname.split('/').filter(Boolean);
    return isId(first) ? first : null;
  }

  if (!YOUTUBE_HOSTS.has(host)) return null;

  if (parsed.pathname === '/watch') {
    const id = parsed.searchParams.get('v');
    return isId(id) ? id : null;
  }

  const match = parsed.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})$/);
  return match && isId(match[1]) ? match[1] : null;
}

/** Every video has this size; the larger ones 404 on older uploads. */
export function youTubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function youTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
