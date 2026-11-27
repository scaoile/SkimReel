import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { SAMPLE_FILE_LINKS } from './lib/samples';

const WATCH_URL = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
const SHARE_URL = 'https://youtu.be/aqz-KE-bpKQ';

const youTubeCards = () => screen.getAllByRole('button', { name: /^Open .+ on YouTube$/ });
const previewCards = () => screen.queryAllByRole('button', { name: /^Preview / });

function load(text: string) {
  fireEvent.change(screen.getByLabelText('Video links'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Load videos' }));
}

/** jsdom has no PointerEvent, so pointerType has to be attached by hand. */
function firePointer(kind: 'pointerover' | 'pointerout', element: Element) {
  const event = new MouseEvent(kind, { bubbles: true, relatedTarget: null });
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  fireEvent(element, event);
}

describe('YouTube links', () => {
  it('renders a card with a thumbnail and nothing to play', () => {
    render(<App />);

    expect(youTubeCards()).toHaveLength(2);
    expect(youTubeCards()[0]).toHaveAccessibleName('Open jNQXAC9IVRw on YouTube');
    expect(youTubeCards()[0].querySelector('video')).toBeNull();
    expect(youTubeCards()[0].querySelector('img')).toHaveAttribute(
      'src',
      'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    );
    expect(screen.getAllByText('YouTube')).toHaveLength(2);
    expect(screen.getAllByText('Length unknown')).toHaveLength(2);
    // Only the direct files carry a sound toggle, and none of them is a slider yet.
    expect(screen.getAllByRole('button', { name: /^Sound for / })).toHaveLength(
      SAMPLE_FILE_LINKS.length,
    );
    expect(screen.queryAllByRole('slider')).toHaveLength(0);
  });

  it('does not preview on hover', () => {
    render(<App />);
    const card = youTubeCards()[0];

    firePointer('pointerover', card);
    firePointer('pointerout', card);

    expect(card.querySelector('video')).toBeNull();
    expect(card).not.toHaveAttribute('aria-pressed');
    expect(screen.getAllByRole('button', { name: /^Sound for / })).toHaveLength(
      SAMPLE_FILE_LINKS.length,
    );
  });

  it('asks before leaving, then opens on YouTube', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(youTubeCards()[0]);

    const dialog = screen.getByRole('dialog', { name: 'Open in a new tab?' });
    expect(dialog).toHaveTextContent('This YouTube video opens on youtube.com. This page stays put.');
    expect(open).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Open in new tab' }));
    expect(open).toHaveBeenCalledWith(WATCH_URL, '_blank', 'noopener,noreferrer');
  });

  it('opens from the keyboard', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    youTubeCards()[0].focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it('stays out of the length buckets, because its length is never known', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('radio', { name: 'Short' }));

    expect(screen.queryAllByRole('button', { name: /^Open .+ on YouTube$/ })).toHaveLength(0);

    await user.click(screen.getByRole('radio', { name: 'All' }));
    expect(youTubeCards()).toHaveLength(2);
  });

  it('collapses two spellings of the same video into one card', () => {
    render(<App />);

    load(`https://youtu.be/jNQXAC9IVRw\nhttps://www.youtube.com/watch?v=jNQXAC9IVRw`);

    expect(youTubeCards()).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Merged 1 duplicate.');
  });

  it('takes the share form too, and names it by its id', () => {
    render(<App />);

    load(SHARE_URL);

    expect(youTubeCards()[0]).toHaveAccessibleName('Open aqz-KE-bpKQ on YouTube');
    expect(screen.getByText('aqz-KE-bpKQ')).toBeInTheDocument();
    expect(previewCards()).toHaveLength(0);
  });
});
