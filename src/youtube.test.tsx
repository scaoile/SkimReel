import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const openCards = () => screen.getAllByRole('button', { name: /^Open .* on YouTube$/ });
const linkCards = () => screen.getAllByRole('button', { name: /^Open / });

/** The three YouTube samples, in paste order. */
const FIRST_OPEN_URL = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';

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

describe('YouTube links', () => {
  beforeEach(() => {
    installStorage();
    vi.restoreAllMocks();
  });

  it('renders a link card with a thumbnail and no media element', () => {
    render(<App />);

    const cards = openCards();
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAccessibleName('Open jNQXAC9IVRw on YouTube');
    expect(cards[0].querySelector('video')).toBeNull();
    expect(cards[0].querySelector('img')).toHaveAttribute(
      'src',
      'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    );
    expect(screen.queryAllByRole('slider')).toHaveLength(0);
  });

  it('offers no length and therefore appears under All only', async () => {
    render(<App />);
    const user = userEvent.setup();

    expect(screen.getAllByText('Length unknown')).toHaveLength(3);

    await user.click(screen.getByRole('radio', { name: 'Short' }));
    expect(screen.queryAllByRole('button', { name: /^Open / })).toHaveLength(0);

    await user.click(screen.getByRole('radio', { name: 'All' }));
    expect(linkCards()).toHaveLength(3);
  });

  it('asks before opening a new tab', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(openCards()[0]);

    const dialog = screen.getByRole('dialog', { name: 'Open on YouTube?' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText("Don't ask again")).not.toBeChecked();
    expect(open).not.toHaveBeenCalled();
  });

  it('opens the link and stays quiet afterwards once the box is ticked', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(openCards()[0]);
    await user.click(screen.getByLabelText("Don't ask again"));
    await user.click(screen.getByRole('button', { name: 'Open YouTube' }));

    expect(open).toHaveBeenCalledWith(FIRST_OPEN_URL, '_blank', 'noopener,noreferrer');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(openCards()[0]);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('does not remember the choice unless the box was ticked', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(openCards()[0]);
    await user.click(screen.getByRole('button', { name: 'Open YouTube' }));
    expect(open).toHaveBeenCalledTimes(1);

    await user.click(openCards()[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('cancels with Escape and with the dismiss button, opening nothing', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(openCards()[0]);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(openCards()[0]);
    await user.click(screen.getByRole('button', { name: 'Stay here' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    expect(open).not.toHaveBeenCalled();
  });

  it('opens straight away when the choice was already remembered', async () => {
    installStorage().setItem('skimreel:skip-open-warning', '1');
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(openCards()[0]);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).toHaveBeenCalledWith(FIRST_OPEN_URL, '_blank', 'noopener,noreferrer');
  });

  it('keeps working when storage is unavailable', async () => {
    Object.defineProperty(window, 'localStorage', { value: undefined, configurable: true });
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const user = userEvent.setup();

    await user.click(openCards()[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByLabelText("Don't ask again"));
    await user.click(screen.getByRole('button', { name: 'Open YouTube' }));
    expect(open).toHaveBeenCalledTimes(1);

    // The choice still holds for this session; only surviving a reload is lost.
    await user.click(openCards()[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('opens from the keyboard', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    const card = openCards()[0];

    card.focus();
    expect(card).toHaveFocus();

    await act(async () => {
      fireEvent.keyDown(card, { key: 'Enter' });
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });
});
