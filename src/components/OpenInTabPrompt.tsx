import { useEffect, useId, useRef, useState } from 'react';
import { fileNameOf, hostOf } from '../lib/format';

type Props = {
  url: string;
  onConfirm: (skipNextTime: boolean) => void;
  onCancel: () => void;
};

/**
 * The one floating layer in the app: a card is a preview, so opening the video itself
 * leaves the page. It says what will happen, where it goes, and can be switched off.
 */
export function OpenInTabPrompt({ url, onConfirm, onCancel }: Props) {
  const [skip, setSkip] = useState(false);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const checkboxId = useId();
  const titleId = useId();
  const bodyId = useId();
  const name = fileNameOf(url);
  const host = hostOf(url);

  useEffect(() => {
    // Send focus back to whatever opened this, so the keyboard user is not stranded.
    const previous = document.activeElement as HTMLElement | null;
    primaryRef.current?.focus();
    return () => {
      previous?.focus?.();
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <div className="scrim" onClick={onCancel}>
      <div
        className="prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 className="prompt__title" id={titleId}>
          Open in a new tab?
        </h2>
        <p className="prompt__body" id={bodyId}>
          {name} opens on {host}. This page stays put.
        </p>

        <div className="prompt__check">
          <input
            id={checkboxId}
            type="checkbox"
            checked={skip}
            onChange={(event) => setSkip(event.target.checked)}
          />
          <label htmlFor={checkboxId}>Don't ask again</label>
        </div>

        <div className="prompt__actions">
          <button type="button" className="prompt__secondary" onClick={onCancel}>
            Stay here
          </button>
          <button
            ref={primaryRef}
            type="button"
            className="prompt__primary"
            onClick={() => onConfirm(skip)}
          >
            Open in new tab
          </button>
        </div>
      </div>
    </div>
  );
}
