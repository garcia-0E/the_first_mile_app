import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../AppContext';
import FileUpload from '../components/FileUpload';
import SearchForm from '../components/SearchForm';
import LeadTable from '../components/LeadTable';
import { searchPartners, generateDrafts, fetchCompanies, fetchPrompts, fetchFilters, updatePrompt } from '../api';

export default function SuggesterEnhancer() {
  const navigate = useNavigate();
  const searchId = useRef(0);
  const { leads, setLeads, selected, setSelected, context, setContext, drafts, setDrafts } = useAppState();

  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showExpandWarning, setShowExpandWarning] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [filterOptions, setFilterOptions] = useState(null);

  // Load companies & filter options on mount
  useEffect(() => {
    fetchCompanies()
      .then(setCompanies)
      .catch((err) => console.error('Failed to load companies:', err));

    fetchFilters()
      .then(setFilterOptions)
      .catch((err) => console.error('Failed to load filters:', err));
  }, []);

  // Sync the prompt template editor whenever the selected prompt changes
  useEffect(() => {
    const prompt = prompts.find((p) => String(p.id) === selectedPrompt);
    setPromptTemplate(prompt?.template ?? '');
    setEditingPrompt(false);
  }, [selectedPrompt, prompts]);

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) {
      setEditingPrompt(true);
      return;
    }
    setSavingPrompt(true);
    try {
      await updatePrompt(selectedPrompt, promptTemplate);
      setPrompts((prev) =>
        prev.map((p) =>
          String(p.id) === selectedPrompt ? { ...p, template: promptTemplate } : p
        )
      );
      setEditingPrompt(false);
    } catch (err) {
      console.error('Failed to update prompt:', err);
      setError(err.message);
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleCompanyChange = async (companyId) => {
    setSelectedCompany(companyId);
    setPrompts([]);
    setSelectedPrompt('');
    if (!companyId) return;
    try {
      const data = await fetchPrompts(companyId);
      setPrompts(data);
      const active = data.find((p) => p.is_active);
      if (active) setSelectedPrompt(String(active.id));
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  };

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

  const handleReset = () => {
    searchId.current++; // invalidate any in-flight search
    setLeads([]);
    setSelected(new Set());
    setContext('');
    setDrafts([]);
    setSelectedCompany('');
    setSelectedPrompt('');
    setPrompts([]);
    setError(null);
    setShowExpandWarning(false);
  };

  const handleGenerateDrafts = async () => {
    if (!selected.size) return;
    setGenerating(true);
    setError(null);

    const selectedLeads = leads.filter((_, i) => selected.has(i));
    const promptName = prompts.find((p) => String(p.id) === selectedPrompt)?.name;

    try {
      const data = await generateDrafts(selectedCompany, promptName, selectedLeads, context);
      setDrafts(data.drafts);
      navigate('/drafts');
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

      <SearchForm
        options={filterOptions}
        onSearch={handleSearch}
        onExpand={() => setShowExpandWarning(true)}
        onReset={handleReset}
        loading={searching}
      />

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
        <>
          <div className="selector-row">
            <label>
              Company
              <select
                value={selectedCompany}
                onChange={(e) => handleCompanyChange(e.target.value)}
              >
                <option value="">Select a company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label>
              Prompt
              <select
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                disabled={!prompts.length}
              >
                <option value="">Select a prompt…</option>
                {prompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.is_active ? ' (active)' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedPrompt && (
            <div className="prompt-editor">
              <label>
                Prompt Template
                <textarea
                  value={promptTemplate}
                  onChange={(e) => setPromptTemplate(e.target.value)}
                  disabled={!editingPrompt || savingPrompt}
                  rows={8}
                />
              </label>
              <button onClick={handleUpdatePrompt} disabled={savingPrompt}>
                {savingPrompt
                  ? 'Saving…'
                  : editingPrompt
                    ? 'Save'
                    : 'Update'}
              </button>
            </div>
          )}

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
              disabled={!selected.size || !context || !selectedCompany || !selectedPrompt || generating}
            >
              {generating
                ? 'Generating…'
                : `Generate Drafts (${selected.size} selected)`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
