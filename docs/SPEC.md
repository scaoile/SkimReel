---
status: ready-for-agent
derived-from: docs/PRD.md
---

# SkimReel — Video Skimmer Spec

## Problem Statement

People who have a handful of video links (direct video files) have no fast way to skim them. Opening each link one by one is slow, and there is no overview of what each video contains or how long it is. They want to paste a list of links, see everything at a glance in one place, preview any video without clicking through, and narrow the list down by how long the videos are.

## Solution

A single-page web app. The user pastes a list of video links, one per line, into a text box and loads them. The page shows the videos as a responsive grid of cards. Hovering a card with a mouse plays a muted, fast-forwarded (2x) preview of that video, and moving the mouse away stops it and returns it to the start. On touch devices, where there is no hover, tapping a card toggles playback. A single filter lets the user narrow the grid by video duration: Short, Medium, Long, or All. Links that fail to load show a clear error tile instead of breaking the grid. The page opens pre-filled with a working sample list so there is something to see immediately.

## User Stories

1. As a visitor, I want the page to open with a sample list of videos already loaded, so that I can see how it works without finding my own links.
2. As a visitor, I want the sample links pre-filled in the text box as well, so that I can see the format I'm expected to paste in.
3. As a visitor, I want a text box where I can paste a list of video links, so that I can view my own videos.
4. As a visitor, I want to enter one link per line, so that pasting a list from a document or spreadsheet just works.
5. As a visitor, I want a "Load" button, so that I control when my pasted list replaces the current grid.
6. As a visitor, I want my pasted list to load only when I press Load, so that half-typed input never destroys the grid I'm looking at.
7. As a visitor, I want blank lines and extra whitespace ignored, so that sloppy pasting does not create errors.
8. As a visitor, I want duplicate links collapsed into one card, so that the grid is not cluttered with repeats.
9. As a visitor, I want lines that are not valid http or https links skipped, so that stray text does not create broken cards.
10. As a visitor, I want a quiet summary of what was ignored when I load, so that I understand why fewer cards appeared than lines I pasted.
11. As a visitor, I want my videos shown in a grid, so that I can scan many of them at once.
12. As a visitor, I want the grid to adapt to my screen width, so that it is usable on a laptop, tablet, and phone.
13. As a visitor, I want the cards to keep the order I pasted them in, so that my list order means something.
14. As a visitor, I want each card to show a still frame of the video before I interact, so that I can tell videos apart at a glance.
15. As a visitor, I want each card to show the link it came from, so that I can tell near-identical videos apart.
16. As a visitor on a computer, I want a video to start playing when I move my mouse over it, so that I can preview it without clicking.
17. As a visitor, I want hover previews to play at 2x speed, so that I can get a feel for a whole video quickly.
18. As a visitor, I want hover previews to be muted, so that moving across the grid does not produce a wall of sound.
19. As a visitor, I want a video to stop and return to its first frame when my mouse leaves, so that every preview starts from the beginning.
20. As a visitor, I want a failed autoplay attempt to be handled quietly, so that browser restrictions never show errors or break the page.
21. As a visitor on a phone or tablet, I want to tap a card to start playing it, so that I can preview videos without hover.
22. As a visitor on a phone or tablet, I want to tap a playing card to pause it, so that I can stop a preview.
23. As a visitor using a mouse, I want touch-only behavior kept separate from hover behavior, so that a stylus or touch event does not trigger hover playback by mistake.
24. As a visitor, I want a duration filter with Short, Medium, Long, and All, so that I can narrow the grid by length.
25. As a visitor, I want Short to mean under 1 minute, Medium to mean 1 to 5 minutes, and Long to mean over 5 minutes, so that the buckets are predictable.
26. As a visitor, I want a video that is exactly 1 minute to count as Medium, so that a clip does not fall between buckets.
27. As a visitor, I want a video that is exactly 5 minutes to count as Medium, so that the boundaries are not ambiguous.
28. As a visitor, I want the filter to start on All, so that I see everything by default.
29. As a visitor, I want the grid to update instantly when I change the filter, so that exploring feels fast.
30. As a visitor, I want the filter to be correct once every video's length is known, so that no matching video is silently missing.
31. As a visitor, I want a card to show a small "loading" badge while its length is still unknown, so that I understand why it may not match a bucket yet.
32. As a visitor, I want videos with an unknown length to appear under All only, so that they are not misfiled into a bucket.
33. As a visitor, I want a listed video not to vanish just because its length is still unknown, so that the grid does not flicker as I look at it.
34. As a visitor, I want a video to move into the right bucket as soon as its length is learned, so that filtering becomes accurate without a reload.
35. As a visitor, I want each card to show its duration once known, so that I can see why it landed in a bucket.
36. As a visitor, I want a link that cannot be loaded to show an error tile, so that I know which link failed.
37. As a visitor, I want the error tile to name the failing link, so that I can fix it.
38. As a visitor, I want one broken link to leave the other cards working, so that a bad link does not ruin the page.
39. As a visitor, I want failed videos to appear only under All, so that they never pollute Short, Medium, or Long.
40. As a visitor, I want the grid limited to the first 30 videos, so that pasting a very long list does not freeze the page.
41. As a visitor, I want the cap taken from the front of my list, so that the notice and the order agree.
42. As a visitor, I want a message such as "showing first 30 of N" when my list is longer than the cap, so that I know some videos are not displayed.
43. As a visitor, I want the cap applied to what is rendered, so that the page's load stays bounded no matter how long my list is.
44. As a visitor, I want the cap notice to stay put as I change the filter, so that I can still tell videos were cut off.
45. As a visitor, I want an empty state when no videos match the selected filter, so that I do not stare at a blank page.
46. As a visitor, I want that empty state to name the filter I picked, so that I know what to change.
47. As a visitor, I want an empty state when my pasted list contains no valid links, so that I know what to fix.
48. As a visitor, I want the two empty states to say different things, so that "nothing matched" is never confused with "nothing worked".
49. As a visitor, I want videos not downloaded in full until I interact with them, so that the page loads quickly and does not waste data.
50. As a visitor, I want old durations, failures, and filter choices cleared when I load a new list, so that old state never leaks into the new grid.
51. As a visitor, I want a card belonging to the previous list to stop playing when I load a new list, so that no stray preview survives the swap.
52. As a keyboard user, I want to reach the text box, the Load button, the filter, and the cards with Tab, so that the page is not mouse-only.
53. As a keyboard user, I want to play and pause a card from the keyboard, so that I can preview without a pointer.
54. As a keyboard user, I want visible focus styling on cards and controls, so that I can see where I am.
55. As a keyboard user, I want the filter operable by keyboard, so that I can change buckets without a mouse.
56. As a visitor, I want the page reachable at a public web address, so that I can open and share it without installing anything.

## Implementation Decisions

### Stack and shape

- A single-page front-end application built with React and Vite. No backend, no routing, no persistence: all state lives in the browser session and is gone on reload.
- TypeScript throughout. Static build output; nothing server-side.
- The page is a fixed vertical flow: an input panel above a control bar (filter plus cap notice) above the video grid.

### Modules

Named as below, and these names are the vocabulary the code and tests should use.

- **Application shell** — owns the whole page state and composes everything else. The only module that holds state.
- **Input panel** — the text box, the Load button, and post-load validation feedback.
- **Link parser** — pure function turning raw pasted text into a clean list of valid, de-duplicated http(s) links in first-seen order.
- **Video grid** — lays out cards, renders the cap notice, and renders the empty states.
- **Video card** — renders one video, handles hover and tap playback, reports metadata, and shows loading, duration, and error states.
- **Filter control** — the four duration buckets as a keyboard-operable single-choice control.
- **Duration bucketing** — pure function mapping a duration in seconds to Short, Medium, or Long.
- **Visible-videos selector** — pure function taking the parsed link list, the durations record, the load-failure record, the active filter, and the cap, and returning what the grid should display plus whether the cap trimmed the list.

### State model

- The application shell owns exactly four pieces of state: the parsed link list, a record of known durations keyed by link, a record of failed links, and the active filter. The raw text box contents and the last validation message are local to the input panel.
- The grid's contents are always derived from those four via the visible-videos selector. Nothing about which videos are displayed is ever stored as its own state, so filter changes and newly learned durations cannot drift out of sync.
- Loading a new list replaces all four: new links, empty durations, empty failures, filter back to All.

### Card to shell contract

- A card reports learned metadata upward with `onMetadata(url, duration)` and failures with `onError(url)`. Cards never read the filter and never hide themselves.
- A card owns only its own playback state: playing or paused, and the reset position.
- The shell records a duration only when it is a finite, positive number. Metadata that reports a duration of zero, NaN, or Infinity leaves the video in the unknown state rather than inventing a bucket or an error.
- The shell must not treat a repeated report for the same link as a change that reorders or re-plays the grid; records are keyed by URL and simply overwrite.

### Filter semantics

- Short: duration under 60 seconds. Medium: 60 seconds up to and including 300 seconds. Long: over 300 seconds. All: everything.
- Boundary rule in one line, so no implementer guesses: 59.9 is Short, 60 is Medium, 300 is Medium, 300.1 is Long.
- Unknown duration: visible under All only, with a loading badge. Hidden under Short, Medium, and Long.
- Failed link: visible under All only, as an error tile. Never visible under a bucket.
- Default filter is All, including on first paint of the sample list.
- Changing the filter never triggers a reload, a re-parse, or a reset of known durations.

### Cap

- At most 30 cards are rendered. The cap is applied to the parsed link list **before** the filter runs: take the first 30 links, then filter those. This is deliberate — only rendered cards load metadata, so filtering an unrendered tail would produce buckets that lie.
- Consequence to accept: with a 100-link pasted list, choosing Short may show fewer than 30 cards even though matches exist beyond the cap. The cap notice is what tells the user that.
- N in "showing first 30 of N" is the full parsed, de-duplicated count, not the line count and not the filtered count.
- The notice renders whenever N exceeds 30, independent of the active filter, and disappears when N is 30 or fewer.
- Pagination was rejected because the duration filter needs every rendered video's metadata, and paging would hide matching videos on unloaded pages.

### Hover and touch behavior

- Videos are always muted; there is no unmute affordance anywhere in this version.
- Hover is gated on pointer type. Only a pointer whose type is mouse may start hover playback; touch and pen never do, so a stylus moving across the grid cannot trigger a preview.
- On mouse enter: set playback rate to 2x, then play. A rejected play promise is swallowed silently — no error state, no console-visible user-facing text, no change to the card's visuals.
- On mouse leave: pause and set the current time back to zero, so the next hover starts from the first frame.
- On touch: a tap toggles play and pause on that card. A tap starts at 2x and muted, the same preview playback as hover, and pausing freezes where it is rather than rewinding. Rewinding is a hover-leave behavior only.
- Keyboard play/pause takes the same path as a touch tap: same rate, same muting, same pause-without-rewind. The card is a focusable control that responds to Enter and Space.
- Playback is per card and independent. Starting a second preview does not stop the first. This is a deliberate consequence of cards not knowing about each other; see Further Notes.

### Loading strategy

- Each video is rendered with `preload="metadata"` and `playsInline`, so the browser fetches enough to know the duration and paint a first frame but no more until the user interacts.
- Metadata arrival is what turns an unknown duration into a known one; a media error is what turns a link into a failed link.
- A card that fails is never retried, never re-requested by the app, and never blocks sibling cards: failures are per link, and the rest of the grid renders regardless.

### Display details

- Duration renders as m:ss under an hour and h:mm:ss at or above it. It appears only once known.
- Each card shows the file name with the host on a line beneath it, because two clips can share a name like `trailer.mp4` and the host is what tells them apart.
- The still frame is sought to roughly two seconds in, or a tenth of the clip if shorter, once metadata arrives. Frame zero is commonly a black or white fade and makes the grid look broken. Playback still begins at zero the first time a preview starts, and hover-leave rewinds to zero.
- The video element stays invisible until it has actually painted a frame. The card's own dark surface owns the colour until then, so no card flashes white or grey while loading.
- Each playable card carries a small play cue over the still frame, hidden while playing, so a well that never paints still reads as something you can play.
- The duration sits on a thin rail beneath the frame that fills as the preview plays, so the label and the playhead are one element.
- The loading badge reads "Loading" and is present exactly while the duration is unknown and the link has not failed.
- The error tile shows the failing link and a short failure label, and is visually distinct from a loading or playable card. It is not focusable for playback because there is nothing to play.
- Empty state copy is distinct per cause: no valid links in the pasted text versus no videos matching the selected bucket. The latter names the bucket.
- Validation feedback after Load is a quiet single line that appears only when something was dropped, e.g. how many lines were skipped as invalid and how many duplicates were collapsed. Nothing appears when every line was used.

### Sample data

- The page opens with 8 to 12 direct https links, all measured to be playable before being committed.
- The original candidate set (`commondatastorage.googleapis.com/gtv-videos-bucket`) is dead: it now answers 403 AccessDenied for anonymous callers, so every card would arrive as an error tile. Do not reintroduce it.
- Use the measured set instead: three short clips (5.05s, 33.00s, 52.21s), two medium (146.46s, 150.15s), three long (596.48s, 653.85s, 888.06s), and one deliberately broken https URL that answers 404.
- Every playable sample must answer `video/mp4` and advertise byte ranges, so seeking and poster frames work.
- Composition requirement stands: at least two clips per bucket, and one deliberate failure so the error tile is visible on first load.
- Every sample link uses https. The page is served over https, so plain http media would be blocked as mixed content and would arrive as a failure rather than a preview.
- The same list pre-fills the text box, so the user can see the expected format and immediately experiment.

### Input handling

- Parsing trims each line, drops blanks, drops anything that does not parse as an http or https URL, and removes duplicates while keeping first-seen order.
- Only http and https are accepted; other schemes are dropped silently like any other invalid line.
- Load reads the text box contents, parses them, and commits the result. A committed empty list is a legitimate state that shows the no-valid-links empty state.

### Styling and accessibility

- Cards sit in a CSS grid that fills available width with a minimum card width, so column count follows the viewport without breakpoint-specific markup.
- Cards are keyboard-focusable, show a visible focus ring, and act as buttons for playback purposes. The filter is a labelled single-choice group reachable and changeable by keyboard.
- Contrast and focus styling must survive the dark-on-light default look; the aesthetic itself is not otherwise specified here (see Further Notes).

### Hosting

- Static deployment to Vercel at a public URL, built from a public source repository, with no server-side configuration and no environment variables.
- Because there is no server, nothing about the app may depend on request headers, redirects, or rewrites.

## Testing Decisions

### What makes a good test

Tests exercise externally visible behavior: what a person sees and can do after pasting links, pressing Load, hovering, tapping, tabbing, or changing the filter. They assert on rendered text, accessible roles and labels, and the state of the media stand-in. They never assert on component internals, state variable names, component prop shapes, or how many times a function was called.

### The seam

One seam only: **the whole page, rendered in jsdom**. Everything below it — the link parser, duration bucketing, and the visible-videos selector — is covered through this seam rather than by direct unit tests. One seam, one test file per behavior group, no mocking of our own modules.

Harness: **Vitest + jsdom + React Testing Library**, driving the page's default export the way a user would.

The single replacement is the media element. A stand-in for `HTMLMediaElement` is installed once in shared test setup, not per test, and exposes:

- a settable `duration` and read-back `currentTime`, plus the ability to fire `loadedmetadata`;
- the ability to fire `error` for failure cases;
- `play()` and `pause()` that record playing state and playback rate, and that can be made to reject so silent-autoplay handling is provable;
- recorded `muted`, `playbackRate`, `preload`, and `playsInline` values, asserted through what the page does rather than by reaching into components.

Harness caveats worth designing around, because jsdom is not a browser:

- jsdom does not synthesize hover. Mouse-entry behavior is exercised by dispatching pointer events with an explicit mouse pointer type, which is also the only way to prove the mouse gate rejects touch and pen.
- Touch taps go through the tap path, not the pointer path, so the tests must be able to drive both and assert that only one of them started playback.
- jsdom has no layout, so nothing may assert on geometry, column counts, or screenshots.

### Behaviors to cover through the seam

- The first paint shows the sample videos as cards, all under All, with the text box pre-filled.
- Pasting a list and pressing Load yields one card per valid, unique link, in order, with blanks, non-http lines, and duplicates dropped. Pressing Load is required: typing alone changes nothing.
- A mouse pointer entering a card starts playback at 2x and muted. Leaving pauses and resets current time to zero. A rejected play promise surfaces nothing to the user and leaves the grid usable.
- A pointer event with touch or pen type does not start playback.
- A touch tap starts playback, and a second tap pauses it.
- Keyboard focus plus Enter or Space toggles playback on the focused card.
- Each bucket shows exactly the right cards once durations are known, including the boundaries: 59.9 Short, 60 Medium, 300 Medium, 300.1 Long.
- A card with unknown duration appears under All with a loading badge and under no bucket, then appears under the correct bucket after its metadata arrives, with no reload and no change of filter.
- A failed link shows an error tile naming the link, appears under All only, and leaves sibling cards interactive.
- A list of more than 30 links renders 30 cards plus the "showing first 30 of N" notice, where N counts the parsed list. A list of exactly 30 shows no notice.
- A pasted list with no valid links shows the no-valid-links empty state; a bucket with no matches shows the bucket-named empty state, not the former.
- Loading a new list resets the filter to All and clears durations and failures from the previous list, so a previously broken link is re-attempted and a previously known duration does not leak onto a new card.
- Tab order reaches the text box, the Load button, the filter, and then the cards.

### Prior art

None. This is a new project with no existing test suite, so these tests establish the pattern: page-level, behavior-first, media stand-in in shared setup.

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
- Cross-card coordination of playback: stopping one preview when another starts.
- Analytics, telemetry, error reporting, and any network calls other than media requests.

## Further Notes

- Browsers only allow autoplay for muted video, which is why previews are always muted. That constraint, not a design preference, is what makes hover preview possible without a click.
- The 30-video cap is simultaneously a performance limit and what keeps the filter trustworthy, because the filter depends on per-video metadata. A larger-scale version needs durations stored on the server or virtualized rendering with lazy metadata loading — the latter reintroduces the filtering problem the cap avoids, since offscreen cards never learn their duration.
- Multiple previews can play at once: hover-leave stops a card on mouse, but touch taps are independent, so tapping three cards leaves three previews running. If that proves annoying, the shell can own a single active-preview URL and pass an active flag down; the spec deliberately stays with per-card independence because it keeps the card-to-shell contract to two callbacks.
- The visual direction is unspecified: the PRD asks for a responsive card grid, visible focus, and clear loading, duration, and error states, and nothing about typography, colour, or motion. An implementer is free to choose, as long as error, loading, and playable cards stay visually distinguishable without relying on colour alone.
- A stylus on a tablet cannot preview a video in this version: hover is mouse-only by design and the tap path is touch-only. Treat this as accepted rather than a bug.
- `preload="metadata"` is a hint, not a guarantee. Some servers return the whole file anyway, and some return metadata slowly. The app must not assume the first frame is painted at metadata time; the still-frame story in the user stories is best-effort.
- Likely next steps after this version: lazy loading of offscreen cards with an intersection observer, a server-side duration cache, broader filters, and fuller keyboard and screen-reader support.
