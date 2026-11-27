import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { media } from './test/mediaStub';

const previewCards = () => screen.getAllByRole('button', { name: /^Preview / });
const videoOf = (card: HTMLElement) => card.querySelector('video') as HTMLVideoElement;
const FIRST_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

/**
 * Node 26 ships its own `localStorage` getter, undefined without --localstorage-file,
 * and it shadows the one jsdom would provide. Install a real store so the preference
 * module is exercised as a browser would exercise it.
 */
function installStorage() {
  const items = new Map<string, string>();
  const store = {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, String(value));
    },
    removeItem: (key: string) => {
      items.delete(key);
    },
    clear: () => {
      items.clear();
    },
  };
  Object.defineProperty(window, 'localStorage', { value: store, configurable: true });
  return store;
}

/** jsdom has no PointerEvent, so pointerType has to be attached by hand. */
function firePointer(kind: 'pointerdown' | 'pointerup', pointerType: string, element: Element) {
  const event = new MouseEvent(kind, { bubbles: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  fireEvent(element, event);
}

describe('opening a card in a new tab', () => {
  beforeEach(() => {
    installStorage();
    vi.restoreAllMocks();
  });

  it('asks first and names the file and its host', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(previewCards()[0]);

    const dialog = screen.getByRole('dialog', { name: 'Open in a new tab?' });
    expect(dialog).toHaveTextContent(
      'flower.mp4 opens on interactive-examples.mdn.mozilla.net. This page stays put.',
    );
    expect(screen.getByLabelText("Don't ask again")).not.toBeChecked();
    expect(open).not.toHaveBeenCalled();
  });

  it('opens with noopener and stays quiet once the box was ticked', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(previewCards()[0]);
    await user.click(screen.getByLabelText("Don't ask again"));
    await user.click(screen.getByRole('button', { name: 'Open in new tab' }));

    expect(open).toHaveBeenCalledWith(FIRST_URL, '_blank', 'noopener,noreferrer');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(previewCards()[0]);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('does not remember the choice unless the box was ticked', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(previewCards()[0]);
    await user.click(screen.getByRole('button', { name: 'Open in new tab' }));
    expect(open).toHaveBeenCalledTimes(1);

    await user.click(previewCards()[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('cancels with Escape and with the dismiss button, opening nothing', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(previewCards()[0]);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(previewCards()[0]);
    await user.click(screen.getByRole('button', { name: 'Stay here' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    expect(open).not.toHaveBeenCalled();
  });

  it('opens straight away when the choice was already remembered', async () => {
    installStorage().setItem('skimreel:skip-open-warning', '1');
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(previewCards()[0]);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).toHaveBeenCalledWith(FIRST_URL, '_blank', 'noopener,noreferrer');
  });

  it('keeps working when storage is unavailable', async () => {
    Object.defineProperty(window, 'localStorage', { value: undefined, configurable: true });
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(previewCards()[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByLabelText("Don't ask again"));
    await user.click(screen.getByRole('button', { name: 'Open in new tab' }));
    expect(open).toHaveBeenCalledTimes(1);

    // The choice still holds for this session; only surviving a reload is lost.
    await user.click(previewCards()[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('does not treat a touch tap as a request to leave', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const card = previewCards()[0];
    const video = videoOf(card);

    firePointer('pointerdown', 'touch', card);
    firePointer('pointerup', 'touch', card);
    await act(async () => {
      await Promise.resolve();
    });

    expect(media.isPlaying(video)).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it('opens from the keyboard through the host line', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    const control = screen.getAllByRole('button', { name: / in a new tab$/ })[0];
    control.focus();
    expect(control).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it('leaves the sound toggle and the rail out of it', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button', { name: /^Sound for / })[0]);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });
});
