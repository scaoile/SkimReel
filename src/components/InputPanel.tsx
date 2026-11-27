import { useId, useState } from 'react';
import type { ParseResult } from '../lib/parseLinks';

type Props = {
  initialText: string;
  onLoad: (raw: string) => ParseResult;
};

function feedbackFor({ links, skipped, duplicates }: ParseResult): string | null {
  if (skipped === 0 && duplicates === 0) return null;

  const parts = [`Loaded ${links.length} ${links.length === 1 ? 'video' : 'videos'}.`];
  if (skipped > 0) {
    parts.push(`Skipped ${skipped} ${skipped === 1 ? 'line that was' : 'lines that were'} not a link.`);
  }
  if (duplicates > 0) {
    parts.push(`Merged ${duplicates} ${duplicates === 1 ? 'duplicate' : 'duplicates'}.`);
  }
  return parts.join(' ');
}

/**
 * The button is last in the DOM, so Tab reaches the box before the action,
 * and grid areas put it beside the label. Visual order and tab order agree.
 */
export function InputPanel({ initialText, onLoad }: Props) {
  const [text, setText] = useState(initialText);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputId = useId();
  const hintId = useId();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(feedbackFor(onLoad(text)));
  };

  return (
    <form className="panel" onSubmit={submit}>
      <label className="panel__label" htmlFor={inputId}>
        Video links
      </label>

      <textarea
        id={inputId}
        className="panel__input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
        aria-describedby={hintId}
      />

      <p className="panel__hint" id={hintId}>
        One link per line. Only http and https links are kept.
      </p>

      <p className="panel__feedback" role="status">
        {feedback}
      </p>

      <button className="panel__button" type="submit">
        Load videos
      </button>
    </form>
  );
}
