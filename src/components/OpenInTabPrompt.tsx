import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  onConfirm: (skipNextTime: boolean) => void;
  onCancel: () => void;
};

export function OpenInTabPrompt({ onConfirm, onCancel }: Props) {
  const [skip, setSkip] = useState(false);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const checkboxId = useId();
  const titleId = useId();
  const bodyId = useId();

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
          Open on YouTube?
        </h2>
        <p className="prompt__body" id={bodyId}>
          SkimReel can't preview YouTube links here, so this opens the video on youtube.com in a
          new tab.
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
            Open YouTube
          </button>
        </div>
      </div>
    </div>
  );
}
