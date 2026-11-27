> **Superseded by [SPEC.md](./SPEC.md).** This PRD is kept as the record of the original request. Where the two differ, SPEC.md wins: it settles the duration-boundary values, the cap-before-filter ordering, how non-finite durations are treated, and pause-versus-rewind behaviour, all of which this document leaves open.

## Problem Statement

People who have a handful of video links (direct video files) have no fast way to skim them. Opening each link one by one is slow, and there is no overview of what each video contains or how long it is. They want to paste a list of links, see everything at a glance in one place, preview any video without clicking through, and narrow the list down by how long the videos are.

## Solution

A single-page web app. The user pastes a list of video links, one per line, into a text box and loads them. The page shows the videos as a responsive grid of cards. Hovering a card with a mouse plays a muted, fast-forwarded (2x) preview of that video, and moving the mouse away stops it and returns it to the start. On touch devices, where there is no hover, tapping a card toggles playback. A single filter lets the user narrow the grid by video duration: Short, Medium, Long, or All. Links that fail to load show a clear error tile instead of breaking the grid. The page opens pre-filled with a working sample list so there is something to see immediately.

## User Stories

1. As a visitor, I want the page to open with a sample list of videos already loaded, so that I can see how it works without finding my own links.
2. As a visitor, I want a text box where I can paste a list of video links, so that I can view my own videos.
3. As a visitor, I want to enter one link per line, so that pasting a list from a document or spreadsheet just works.
4. As a visitor, I want a "Load" button, so that I control when my pasted list replaces the current grid.
5. As a visitor, I want blank lines and extra whitespace ignored, so that sloppy pasting does not create errors.
6. As a visitor, I want duplicate links collapsed into one card, so that the grid is not cluttered with repeats.
7. As a visitor, I want lines that are not valid http or https links skipped, so that stray text does not create broken cards.
8. As a visitor, I want my videos shown in a grid, so that I can scan many of them at once.
9. As a visitor, I want the grid to adapt to my screen width, so that it is usable on a laptop, tablet, and phone.
10. As a visitor, I want each card to show a still frame of the video before I interact, so that I can tell videos apart at a glance.
11. As a visitor on a computer, I want a video to start playing when I move my mouse over it, so that I can preview it without clicking.
12. As a visitor, I want hover previews to play at 2x speed, so that I can get a feel for a whole video quickly.
13. As a visitor, I want hover previews to be muted, so that moving across the grid does not produce a wall of sound.
14. As a visitor, I want a video to stop and return to its first frame when my mouse leaves, so that every preview starts from the beginning.
15. As a visitor, I want a failed autoplay attempt to be handled quietly, so that browser restrictions never show errors or break the page.
16. As a visitor on a phone or tablet, I want to tap a card to start playing it, so that I can preview videos without hover.
17. As a visitor on a phone or tablet, I want to tap a playing card to pause it, so that I can stop a preview.
18. As a visitor using a mouse, I want touch-only behavior kept separate from hover behavior, so that a stylus or touch event does not trigger hover playback by mistake.
19. As a visitor, I want a duration filter with Short, Medium, Long, and All, so that I can narrow the grid by length.
20. As a visitor, I want Short to mean under 1 minute, Medium to mean 1 to 5 minutes, and Long to mean over 5 minutes, so that the buckets are predictable.
21. As a visitor, I want the filter to start on All, so that I see everything by default.
22. As a visitor, I want the grid to update instantly when I change the filter, so that exploring feels fast.
23. As a visitor, I want the filter to be correct once every video's length is known, so that no matching video is silently missing.
24. As a visitor, I want a card to show a small "loading" badge while its length is still unknown, so that I understand why it may not match a bucket yet.
25. As a visitor, I want videos with an unknown length to appear under All only, so that they are not misfiled into a bucket.
26. As a visitor, I want a video to move into the right bucket as soon as its length is learned, so that filtering becomes accurate without a reload.
27. As a visitor, I want each card to show its duration once known, so that I can see why it landed in a bucket.
28. As a visitor, I want a link that cannot be loaded to show an error tile, so that I know which link failed.
29. As a visitor, I want one broken link to leave the other cards working, so that a bad link does not ruin the page.
30. As a visitor, I want failed videos to appear only under All, so that they never pollute Short, Medium, or Long.
31. As a visitor, I want the grid limited to the first 30 videos, so that pasting a very long list does not freeze the page.
32. As a visitor, I want a message such as "showing first 30 of N" when my list is longer than the cap, so that I know some videos are not displayed.
33. As a visitor, I want the cap applied to what is rendered, so that the page's load stays bounded no matter how long my list is.
34. As a visitor, I want an empty state when no videos match the selected filter, so that I do not stare at a blank page.
35. As a visitor, I want an empty state when my pasted list contains no valid links, so that I know what to fix.
36. As a visitor, I want videos not downloaded in full until I interact with them, so that the page loads quickly and does not waste data.
37. As a visitor, I want old durations, failures, and filter choices cleared when I load a new list, so that old state never leaks into the new grid.
38. As a keyboard user, I want to reach and play cards without a mouse, so that the page is not mouse-only.
39. As a keyboard user, I want visible focus styling on cards and controls, so that I can see where I am.
40. As a visitor, I want the page reachable at a public web address, so that I can open and share it without installing anything.

## Implementation Decisions

- **Stack and shape:** a single-page front-end application built with React and Vite. There is no backend, no routing, and no persistence. All state lives in the browser session.
- **Modules:**
  - An application shell that owns the whole page state and composes everything else.
  - An input panel containing the text box, the Load button, and validation feedback.
  - A link parser, a pure function that turns raw pasted text into a clean list of valid, de-duplicated http(s) links in their original order.
  - A video grid that lays out cards and shows the cap notice and empty states.
  - A video card that renders one video, handles hover and tap playback, reports metadata, and shows loading, duration, and error states.
  - A filter control for the duration buckets.
  - A duration bucketing function, a pure function that maps a duration in seconds to Short, Medium, or Long.
  - A visible-videos selector, a pure function that takes the link list, the durations record, the load-failure record, the active filter, and the cap, and returns what the grid should display.
- **State model:** the application shell owns the list of links, a record of known durations keyed by link, a record of failed links, and the active filter. The grid's contents are derived from these as a pure function, never stored separately.
- **Card to shell contract:** each card reports learned metadata upward through an `onMetadata(url, duration)` callback and reports failures through a matching error callback. Cards do not read the filter and do not filter themselves.
- **Filter semantics:**
  - Buckets: Short is under 60 seconds, Medium is 60 seconds to 5 minutes, Long is over 5 minutes, and All shows everything.
  - Videos whose duration is not yet known are shown under All only, with a loading badge.
  - Videos that failed to load are shown under All only, as an error tile.
  - Default filter is All.
- **Cap:** at most 30 videos are rendered. If the parsed list is longer, a "showing first 30 of N" notice is displayed. Pagination was explicitly rejected, because the duration filter needs every rendered video's metadata and paging would hide matching videos on unloaded pages.
- **Hover behavior:**
  - Videos are always muted.
  - On a mouse pointer entering a card, set playback rate to 2x and start playing, handling the rejected play promise silently.
  - On the pointer leaving, pause and reset to the start.
  - Hover is gated on the pointer type being a mouse, so touch and pen input never trigger it.
  - On touch, a tap toggles play and pause.
- **Loading strategy:** each video loads only its metadata until the user interacts with it.
- **Sample data:** the page opens pre-filled with 8 to 12 direct, https links from a public sample video set. The set includes at least two clips per duration bucket and one deliberately broken link, so every filter state and the error tile are visible on first load. Every link must use https, because the page is served over https and plain http media would be blocked as mixed content.
- **Input handling:** parsing trims each line, drops blanks, drops anything that is not an http or https link, and removes duplicates while keeping first-seen order. Loading a new list resets durations, failures, and the filter.
- **Hosting:** a static deployment to Vercel at a public URL, built from a public source repository, with no server-side configuration needed.
- **Accessibility:** cards are keyboard-focusable and can be played and paused from the keyboard. Focus styles are visible. The filter is operable by keyboard.

## Testing Decisions

- **What makes a good test:** tests exercise externally visible behavior, such as what the user sees after pasting links, hovering, tapping, or changing the filter. They do not assert on component internals, state variable names, or how many times a function was called.
- **Seam:** the single highest seam is the whole page rendered in a browser-like test environment. Tests interact as a user would (type into the text box, click Load, change the filter, hover and tap cards) and assert on what is displayed. The video element is the only thing replaced, with a lightweight stand-in that exposes controllable duration, error, play, and pause behavior, because real media loading is not available or deterministic in tests.
- **Behaviors to cover through that seam:**
  - Pasting a list yields one card per valid, unique link in order, with blanks, invalid lines, and duplicates dropped.
  - Hovering with a mouse starts playback at 2x and muted. Leaving pauses and resets to the start. A rejected play does not surface an error.
  - A touch tap toggles playback and does not trigger hover behavior.
  - Each filter bucket shows exactly the right videos once durations are known, including the boundary values at 1 minute and 5 minutes.
  - Videos with unknown duration appear only under All, then move to the correct bucket once duration is reported.
  - A failed video shows an error tile, remains under All only, and does not affect other cards.
  - A list longer than 30 shows 30 cards and the "showing first 30 of N" notice.
  - Empty states appear for no valid links and for a filter with no matches.
  - Loading a new list resets the filter and clears old durations and failures.
- **Prior art:** this is a new project, so there is no existing test suite to follow.

## Out of Scope

- Pagination, infinite scroll, and virtualized or lazily loaded offscreen videos.
- A backend, accounts, saved lists, or any form of persistence between sessions.
- Streaming formats and embedded players such as YouTube or Vimeo links. Only direct video file links are supported.
- Filters other than duration, and sorting.
- Fetching titles, thumbnails, tags, or any metadata beyond what the video file itself provides in the browser.
- Importing links from files, and exporting or sharing a list.
- Sound, a full-screen or detail player view, and playback controls beyond hover and tap.
- Server-side caching of durations.
- Handling of CORS-restricted or hotlink-protected hosts beyond showing the error tile.

## Further Notes

- Browsers only allow autoplay for muted video, which is why previews are always muted.
- Because the duration filter depends on per-video metadata, the 30-video cap is both a performance limit and what keeps the filter trustworthy. A larger-scale version would need durations stored on a server, or virtualized rendering with lazy metadata loading.
- Likely next steps after this version: lazy loading of offscreen cards with an intersection observer, a server-side duration cache, broader filters, and fuller keyboard and screen-reader support.
