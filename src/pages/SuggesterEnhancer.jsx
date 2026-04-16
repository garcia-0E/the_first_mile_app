import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import SearchForm from '../components/SearchForm';
import LeadTable from '../components/LeadTable';
import { searchPartners, generateDrafts } from '../api';

export default function SuggesterEnhancer() {
  const navigate = useNavigate();
  const searchId = useRef(0);

  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [context, setContext] = useState('');
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showExpandWarning, setShowExpandWarning] = useState(false);

  const handleSearch = async (params) => {
    const id = ++searchId.current;
    setSearching(true);
    setError(null);
    try {
      const results = await searchPartners(params);
      if (id !== searchId.current) return; // stale request
      // Deduplicate by email
      const seen = new Set();
      const unique = results.filter((r) => {
        const email = (r.payload || r).email;
        if (!email || seen.has(email)) return false;
        seen.add(email);
        return true;
      });
      setLeads(unique);
      setSelected(new Set());
    } catch (err) {
      if (id !== searchId.current) return;
      setError(err.message);
    } finally {
      if (id === searchId.current) setSearching(false);
    }
  };

  const toggleLead = (idx) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleAll = (selectAll) => {
    if (selectAll) {
      setSelected(new Set(leads.map((_, i) => i)));
    } else {
      setSelected(new Set());
    }
  };

  const handleGenerateDrafts = async () => {
    if (!selected.size) return;
    setGenerating(true);
    setError(null);

    const selectedLeads = leads.filter((_, i) => selected.has(i));

    try {
      const data = await generateDrafts(selectedLeads, context);
      navigate('/drafts', { state: { drafts: data.drafts } });
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page">
      <h2>Suggester / Enhancer</h2>

      <FileUpload />

      <hr />

      <SearchForm onSearch={handleSearch} onExpand={() => setShowExpandWarning(true)} loading={searching} />

      {showExpandWarning && (
        <div className="modal-overlay" onClick={() => setShowExpandWarning(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Additional Cost Warning</h3>
            <p>
              Expanding the search will consume additional API credits and may
              incur extra charges on your account. Are you sure you want to
              proceed?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowExpandWarning(false)}>
                Cancel
              </button>
              <button onClick={() => { setShowExpandWarning(false); /* TODO: expand logic */ }}>
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="status-err">{error}</p>}

      <LeadTable
        leads={leads}
        selected={selected}
        onToggle={toggleLead}
        onToggleAll={toggleAll}
      />

      {leads.length > 0 && (
        <div className="draft-actions">
          <label>
            Campaign Context
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe the campaign purpose…"
              rows={3}
              required
            />
          </label>
          <button
            onClick={handleGenerateDrafts}
            disabled={!selected.size || !context || generating}
          >
            {generating
              ? 'Generating…'
              : `Generate Drafts (${selected.size} selected)`}
          </button>
        </div>
      )}
    </div>
  );
}
