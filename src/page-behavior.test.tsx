import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { SAMPLE_TEXT } from './lib/samples';
import { media } from './test/mediaStub';

const previewCards = () => screen.getAllByRole('button', { name: /^Preview / });
const videoOf = (card: HTMLElement) => card.querySelector('video') as HTMLVideoElement;

async function settlePlay() {
  await act(async () => {
    await Promise.resolve();
  });
}

/**
 * jsdom has no PointerEvent, so fireEvent drops pointerType. Dispatching a plain
 * Event with the property attached is the only way to exercise the mouse gate.
 */
function firePointer(type: 'pointerover' | 'pointerout' | 'pointerup', pointerType: string, element: Element) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  fireEvent(element, event);
}

function load(text: string) {
  fireEvent.change(screen.getByLabelText('Video links'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Load videos' }));
}

describe('pasted lists', () => {
  it('keeps one card per valid unique link, in order, and reports what it dropped', () => {
    render(<App />);

    load(
      [
        'https://a.example/one.mp4',
        '',
        '   https://a.example/one.mp4   ',
        'this is not a link',
        'ftp://a.example/ignored.mp4',
        'https://a.example/two.mp4',
      ].join('\n'),
    );

    const cards = previewCards();
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAccessibleName('Preview one.mp4');
    expect(cards[1]).toHaveAccessibleName('Preview two.mp4');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Skipped 2 lines that were not a link. Merged 1 duplicate.',
    );
  });

  it('shows the no-valid-links empty state when nothing parses', () => {
    render(<App />);

    load('nothing here\nnor here');

    expect(screen.getByText('No videos loaded.')).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /^Preview / })).toHaveLength(0);
  });

  it('does not touch the grid until Load is pressed', () => {
    render(<App />);
    const before = previewCards().length;

    fireEvent.change(screen.getByLabelText('Video links'), {
      target: { value: 'https://a.example/only.mp4' },
    });

    expect(previewCards()).toHaveLength(before);
  });
});

describe('preview playback', () => {
  it('starts a muted 2x preview when a mouse pointer enters, and rewinds on leave', async () => {
    render(<App />);
    const card = previewCards()[0];
    const video = videoOf(card);

    firePointer('pointerover', 'mouse', card);
    await settlePlay();

    expect(media.isPlaying(video)).toBe(true);
    expect(media.playbackRate(video)).toBe(2);
    expect(video.muted).toBe(true);

    act(() => {
      media.reportDuration(video, 45);
    });
    fireEvent.timeUpdate(video);

    firePointer('pointerout', 'mouse', card);
    await settlePlay();

    expect(media.isPlaying(video)).toBe(false);
    expect(media.currentTime(video)).toBe(0);
  });

  it('ignores touch and pen pointers for hover', async () => {
    render(<App />);
    const card = previewCards()[0];
    const video = videoOf(card);

    firePointer('pointerover', 'touch', card);
    firePointer('pointerover', 'pen', card);
    await settlePlay();

    expect(media.isPlaying(video)).toBe(false);
  });

  it('toggles on a touch tap without triggering hover behaviour', async () => {
    render(<App />);
    const card = previewCards()[0];
    const video = videoOf(card);

    firePointer('pointerup', 'touch', card);
    await settlePlay();
    expect(media.isPlaying(video)).toBe(true);

    firePointer('pointerup', 'touch', card);
    await settlePlay();
    expect(media.isPlaying(video)).toBe(false);
  });

  it('leaves a pen tap alone, so a stylus never previews', async () => {
    render(<App />);
    const card = previewCards()[0];
    const video = videoOf(card);

    firePointer('pointerup', 'pen', card);
    await settlePlay();

    expect(media.isPlaying(video)).toBe(false);
  });

  it('toggles from the keyboard', async () => {
    render(<App />);
    const card = previewCards()[0];
    const video = videoOf(card);

    card.focus();
    expect(card).toHaveFocus();

    fireEvent.keyDown(card, { key: 'Enter' });
    await settlePlay();
    expect(media.isPlaying(video)).toBe(true);

    fireEvent.keyDown(card, { key: ' ' });
    await settlePlay();
    expect(media.isPlaying(video)).toBe(false);
  });

  it('stays quiet when the browser rejects play', async () => {
    render(<App />);
    const card = previewCards()[0];
    const video = videoOf(card);

    media.rejectNextPlay = true;
    firePointer('pointerover', 'mouse', card);
    await settlePlay();

    expect(media.isPlaying(video)).toBe(false);
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
  });

  it('recovers on the next hover after a blocked play', async () => {
    render(<App />);
    const card = previewCards()[0];
    const video = videoOf(card);

    media.rejectNextPlay = true;
    firePointer('pointerover', 'mouse', card);
    await settlePlay();
    expect(media.isPlaying(video)).toBe(false);

    firePointer('pointerout', 'mouse', card);
    firePointer('pointerover', 'mouse', card);
    await settlePlay();

    expect(media.isPlaying(video)).toBe(true);
  });

  it('asks for metadata only, stays inline, and is muted before anything plays', () => {
    render(<App />);
    const video = videoOf(previewCards()[0]);

    expect(video.getAttribute('preload')).toBe('metadata');
    expect(video.hasAttribute('playsinline')).toBe(true);
    expect(video.muted).toBe(true);
  });
});

describe('the length filter', () => {
  it('shows only matching videos once durations are known, including the boundaries', async () => {
    render(<App />);
    const cards = previewCards();

    act(() => {
      media.reportDuration(videoOf(cards[0]), 59.9);
      media.reportDuration(videoOf(cards[1]), 60);
      media.reportDuration(videoOf(cards[2]), 300);
      media.reportDuration(videoOf(cards[3]), 300.1);
    });

    const user = userEvent.setup();

    await user.click(screen.getByRole('radio', { name: 'Short' }));
    expect(previewCards().map((card) => card.getAttribute('aria-label'))).toEqual([
      'Preview flower.mp4',
    ]);

    await user.click(screen.getByRole('radio', { name: 'Medium' }));
    expect(previewCards()).toHaveLength(2);

    await user.click(screen.getByRole('radio', { name: 'Long' }));
    expect(previewCards()).toHaveLength(1);

    await user.click(screen.getByRole('radio', { name: 'All' }));
    expect(previewCards()).toHaveLength(9);
  });

  it('hides videos with unknown length outside All, then moves them into place', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('radio', { name: 'Short' }));
    expect(screen.getByText('Nothing in Short.')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'All' }));
    const card = previewCards()[0];
    expect(screen.getAllByText('Loading')).toHaveLength(9);

    act(() => {
      media.reportDuration(videoOf(card), 12);
    });

    expect(screen.getAllByText('Loading')).toHaveLength(8);
    expect(screen.getByText('0:12')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Short' }));
    expect(previewCards()).toHaveLength(1);
  });

  it('keeps a failed link under All only and leaves its siblings playable', async () => {
    render(<App />);
    const cards = previewCards();

    act(() => {
      media.reportError(videoOf(cards[0]));
    });

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(
      screen.getByText('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'),
    ).toBeInTheDocument();
    expect(previewCards()).toHaveLength(8);

    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Short' }));
    expect(screen.queryByText('Failed to load')).not.toBeInTheDocument();
  });
});

describe('the cap', () => {
  it('renders 30 cards and says so when the list is longer', () => {
    render(<App />);

    const many = Array.from({ length: 31 }, (_, index) => `https://a.example/clip-${index}.mp4`);
    load(many.join('\n'));

    expect(previewCards()).toHaveLength(30);
    expect(screen.getByText('Showing first 30 of 31 links.')).toBeInTheDocument();
    expect(previewCards().at(-1)).toHaveAccessibleName('Preview clip-29.mp4');
    expect(
      previewCards().some((card) => card.getAttribute('aria-label') === 'Preview clip-30.mp4'),
    ).toBe(false);
  });

  it('shows no notice at exactly 30 links', () => {
    render(<App />);

    const thirty = Array.from({ length: 30 }, (_, index) => `https://a.example/clip-${index}.mp4`);
    load(thirty.join('\n'));

    expect(previewCards()).toHaveLength(30);
    expect(screen.queryByText(/Showing first/)).not.toBeInTheDocument();
  });
});

describe('loading a new list', () => {
  it('resets the filter and forgets old durations and failures', async () => {
    render(<App />);
    const cards = previewCards();

    act(() => {
      media.reportDuration(videoOf(cards[0]), 5);
      media.reportError(videoOf(cards[1]));
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Short' }));
    expect(previewCards()).toHaveLength(1);

    load('https://b.example/fresh.mp4');

    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    expect(previewCards()).toHaveLength(1);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.queryByText('Failed to load')).not.toBeInTheDocument();
  });

  it('starts every card over when the same list is pasted again', () => {
    render(<App />);
    const previousVideos = previewCards().map(videoOf);

    act(() => {
      previewCards().forEach((card) => media.reportDuration(videoOf(card), 45));
    });
    expect(screen.queryAllByText('Loading')).toHaveLength(0);
    expect(screen.getAllByText('0:45')).toHaveLength(9);

    load(SAMPLE_TEXT);

    // A reused media element never fires loadedmetadata again, so a stale one stays Loading forever.
    expect(previousVideos.every((video) => !video.isConnected)).toBe(true);
    expect(screen.getAllByText('Loading')).toHaveLength(9);

    act(() => {
      previewCards().forEach((card) => media.reportDuration(videoOf(card), 12));
    });

    expect(screen.queryAllByText('Loading')).toHaveLength(0);
    expect(screen.getAllByText('0:12')).toHaveLength(9);
  });

  it('stops a preview that belonged to the previous list', async () => {
    render(<App />);
    const oldCard = previewCards()[0];
    const oldVideo = videoOf(oldCard);

    firePointer('pointerover', 'mouse', oldCard);
    await settlePlay();
    expect(media.isPlaying(oldVideo)).toBe(true);

    load('https://b.example/fresh.mp4');

    expect(screen.queryByLabelText('Preview flower.mp4')).not.toBeInTheDocument();
    expect(media.isPlaying(oldVideo)).toBe(false);
  });
});

describe('keyboard and tab order', () => {
  it('reaches the box, the Load button, the filter and then the cards', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.tab();
    expect(screen.getByLabelText('Video links')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Load videos' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('radio', { name: 'All' })).toHaveFocus();

    const visited: Element[] = [];
    for (let step = 0; step < 8; step += 1) {
      await user.tab();
      const focused = document.activeElement as Element;
      visited.push(focused);
      if (focused === previewCards()[0]) break;
    }

    expect(document.activeElement).toBe(previewCards()[0]);
    expect(visited.length).toBeGreaterThan(0);
  });
});

describe('card sound', () => {
  it('offers a toggle on playable cards and none on the error tile', () => {
    render(<App />);
    expect(screen.getAllByRole('button', { name: /^Sound for / })).toHaveLength(9);

    act(() => {
      media.reportError(videoOf(previewCards()[0]));
    });

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Sound for / })).toHaveLength(8);
  });

  it('starts muted and switches only its own card', async () => {
    render(<App />);
    const cards = previewCards();
    const first = videoOf(cards[0]);
    const second = videoOf(cards[1]);
    const toggle = screen.getAllByRole('button', { name: /^Sound for / })[0];

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(first.muted).toBe(true);

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(first.muted).toBe(false);
    expect(second.muted).toBe(true);
  });

  it('previews with sound once the card is unmuted', async () => {
    render(<App />);
    const card = previewCards()[0];
    const video = videoOf(card);

    await userEvent.click(screen.getAllByRole('button', { name: /^Sound for / })[0]);
    firePointer('pointerover', 'mouse', card);
    await settlePlay();

    expect(media.isPlaying(video)).toBe(true);
    expect(video.muted).toBe(false);
    expect(media.playbackRate(video)).toBe(2);
  });

  it('does not treat a touch on the sound control as a play toggle', async () => {
    render(<App />);
    const video = videoOf(previewCards()[0]);
    const toggle = screen.getAllByRole('button', { name: /^Sound for / })[0];

    firePointer('pointerup', 'touch', toggle);
    await settlePlay();

    expect(media.isPlaying(video)).toBe(false);
  });
});
