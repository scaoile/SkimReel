# SkimReel

Paste a list of video links, one per line, and skim them as a grid. Hover a card to
preview it at 2×, or tap it on a phone. Click a card to open the original in a new tab.

Only direct video files are supported. The page opens with a working sample list.

## Run it

```
npm install
npm run dev
```

## Build

```
npm run build
```

Static output in `dist/`. No backend, no routing, no environment variables.

## Test

```
npm test
```

Page-level tests drive the app the way a person does, with a stand-in for the media
element rather than mocks of the app's own modules.

## Where things are

- `docs/SPEC.md` — the behaviour the app is measured against
- `docs/PRD.md` — the problem it was built from
- `src/lib/` — pure pieces: link parsing, duration buckets, the visible-videos selector
- `src/components/` — shell, input panel, filter, grid, card, open prompt
