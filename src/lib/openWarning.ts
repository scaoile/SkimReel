const KEY = 'skimreel:skip-open-warning';

/**
 * The only thing this app remembers between sessions: a visitor who has ticked
 * "Don't ask again" should not be asked again. Everything else is per-session.
 */
export function readSkipOpenWarning(): boolean {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    // Storage can be blocked; asking every time is the safe fallback.
    return false;
  }
}

export function writeSkipOpenWarning(skip: boolean): void {
  try {
    if (skip) window.localStorage.setItem(KEY, '1');
    else window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do: the choice simply will not survive the session.
  }
}
