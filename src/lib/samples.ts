/**
 * Measured against the live hosts, not copied from a catalogue.
 * Buckets: 3 short (5.05s, 33.00s, 52.21s), 2 medium (146.46s, 150.15s),
 * 3 long (596.48s, 653.85s, 888.06s), plus one deliberate 404 for the error tile.
 */
export const SAMPLE_FILE_LINKS: readonly string[] = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://images-assets.nasa.gov/video/JPL-20190402-OCOf-0001-OCO3%20Mission%20Overview/JPL-20190402-OCOf-0001-OCO3%20Mission%20Overview~mobile.mp4',
  'https://archive.org/download/CaminandesLlamigos/Caminandes_%20Llamigos-1080p.mp4',
  'https://media.w3.org/2010/05/bunny/movie.mp4',
  'https://archive.org/download/ElephantsDream/ed_1024.mp4',
  'https://archive.org/download/Sintel/sintel-2048-stereo_512kb.mp4',
  'https://media.w3.org/2010/05/sintel/missing-clip.mp4',
];

export const SAMPLE_LINKS: readonly string[] = [...SAMPLE_FILE_LINKS];

export const SAMPLE_TEXT = SAMPLE_LINKS.join('\n');
