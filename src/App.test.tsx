import { render, screen } from '@testing-library/react';
import App from './App';
import { SAMPLE_FILE_LINKS, SAMPLE_TEXT } from './lib/samples';

describe('SkimReel first paint', () => {
  it('opens with the sample links in the box and a card for every one of them', () => {
    render(<App />);

    expect(screen.getByLabelText('Video links')).toHaveValue(SAMPLE_TEXT);
    expect(screen.getAllByRole('button', { name: /^Preview / })).toHaveLength(
      SAMPLE_FILE_LINKS.length,
    );
    expect(screen.getAllByText('Loading')).toHaveLength(SAMPLE_FILE_LINKS.length);
    expect(screen.getAllByRole('button', { name: / in a new tab$/ })).toHaveLength(
      SAMPLE_FILE_LINKS.length,
    );
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
  });

  it('shows no failure tile until the media element reports one', () => {
    render(<App />);

    expect(screen.queryByText('Failed to load')).not.toBeInTheDocument();
  });
});
