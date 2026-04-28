import { useState } from 'react';

const SINGLE_VALUE_FILTERS = [
  { key: 'country', label: 'Country' },
  { key: 'partnership_types', label: 'Partnership Type' },
  { key: 'partnership_offer', label: 'Partnership Offer' },
  { key: 'stage', label: 'Stage' },
  { key: 'seniority', label: 'Seniority' },
  { key: 'title', label: 'Title' },
];

const EXCLUDE_FILTERS = [
  { key: 'exclude_industries', label: 'Exclude Industries' },
  { key: 'company_name_to_exclude', label: 'Exclude Companies' },
];

const initialState = () => ({
  description: '',
  themes: '',
  target_communities: '',
  country: '',
  partnership_types: '',
  partnership_offer: '',
  stage: '',
  seniority: '',
  title: '',
  exclude_industries: [],
  company_name_to_exclude: [],
  top_k: 20,
});

export default function SearchForm({ options, onSearch, onExpand, onReset, loading }) {
  const [values, setValues] = useState(initialState);

  const set = (key) => (e) => {
    const target = e.target;
    if (target.multiple) {
      const selected = Array.from(target.selectedOptions, (o) => o.value);
      setValues((v) => ({ ...v, [key]: selected }));
    } else if (target.type === 'number') {
      setValues((v) => ({ ...v, [key]: Number(target.value) }));
    } else {
      setValues((v) => ({ ...v, [key]: target.value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(values);
  };

  const handleReset = () => {
    setValues(initialState());
    onReset?.();
  };

  const opts = options || {};
  const optionsFor = (key) => opts[key] || [];

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <h3>Search Partners</h3>

      <label>
        Description
        <textarea
          value={values.description}
          onChange={set('description')}
          placeholder="Describe the type of partner you're looking for…"
          rows={3}
        />
      </label>

      <div className="search-form-row">
        <label>
          Themes
          <input
            value={values.themes}
            onChange={set('themes')}
            placeholder="e.g. mental health, media literacy"
          />
        </label>
        <label>
          Target Communities
          <input
            value={values.target_communities}
            onChange={set('target_communities')}
            placeholder="e.g. youth, refugees"
          />
        </label>
      </div>

      <div className="search-form-grid">
        {SINGLE_VALUE_FILTERS.map(({ key, label }) => (
          <label key={key}>
            {label}
            <select value={values[key]} onChange={set(key)}>
              <option value="">Any</option>
              {optionsFor(key).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="search-form-row">
        {EXCLUDE_FILTERS.map(({ key, label }) => (
          <label key={key}>
            {label}
            <select multiple value={values[key]} onChange={set(key)} size={4}>
              {optionsFor(key).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Top Results
          <input
            type="number"
            min={1}
            max={100}
            value={values.top_k}
            onChange={set('top_k')}
          />
        </label>
      </div>

      <div className="search-form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
        <button type="button" className="btn-expand" onClick={onExpand} disabled={loading}>
          Expand
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={loading}>
          Reset
        </button>
      </div>
    </form>
  );
}
