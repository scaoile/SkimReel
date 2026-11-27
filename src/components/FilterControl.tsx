import { FILTERS, type Filter } from '../lib/buckets';

type Props = {
  value: Filter;
  onChange: (filter: Filter) => void;
};

export function FilterControl({ value, onChange }: Props) {
  return (
    <fieldset className="filter">
      <legend className="filter__legend">Length</legend>
      <div className="filter__track">
        {FILTERS.map((option) => (
          <label className="filter__option" key={option.id}>
            <input
              type="radio"
              name="length-filter"
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span className="filter__face">{option.label}</span>
          </label>
        ))}
      </div>
      <p className="filter__hint">
        Short is under a minute, medium runs one to five minutes, long is over five.
      </p>
    </fieldset>
  );
}
