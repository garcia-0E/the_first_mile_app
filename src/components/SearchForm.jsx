import { useState } from 'react';

export default function SearchForm({ onSearch, onExpand, loading }) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [seniority, setSeniority] = useState('');
  const [topK, setTopK] = useState(20);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      query,
      country: country || undefined,
      seniority: seniority || undefined,
      top_k: topK,
    });
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <h3>Search Partners</h3>

      <label>
        Query
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe the type of partner you're looking for…"
          rows={3}
          required
        />
      </label>

      <div className="search-form-row">
        <label>
          Country
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. United States"
          />
        </label>

        <label>
          Seniority
          <input
            value={seniority}
            onChange={(e) => setSeniority(e.target.value)}
            placeholder="e.g. Director"
          />
        </label>

        <label>
          Top K
          <input
            type="number"
            min={1}
            max={100}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
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
      </div>
    </form>
  );
}
