const BASE = import.meta.env.DEV
  ? '/api'
  : 'https://cloudrun-service-tfm-hldtgmwh2a-uc.a.run.app';

export async function uploadCSV(file) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}/enhancer`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function searchPartners(params) {
  // Strip empty strings, undefined, and empty arrays so the server only sees
  // criteria the user actively set.
  const body = {};
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    body[key] = value;
  }

  const res = await fetch(`${BASE}/suggester`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  return res.json();
}

export async function fetchFilters() {
  const res = await fetch(`${BASE}/filters`);
  if (!res.ok) throw new Error(`Failed to load filters: ${res.statusText}`);
  return res.json();
}

export async function generateDrafts(companyId, promptName, leads, context) {
  const res = await fetch(`${BASE}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company_id: companyId, prompt_name: promptName, leads, context }),
  });

  if (!res.ok) throw new Error(`Draft generation failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCompanies() {
  const res = await fetch(`${BASE}/companies`);
  if (!res.ok) throw new Error(`Failed to load companies: ${res.statusText}`);
  return res.json();
}

export async function fetchPrompts(companyId) {
  const res = await fetch(`${BASE}/prompts/${companyId}`);
  if (!res.ok) throw new Error(`Failed to load prompts: ${res.statusText}`);
  return res.json();
}

export async function updatePrompt(promptId, template) {
  const res = await fetch(`${BASE}/prompts/${promptId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template }),
  });
  if (!res.ok) throw new Error(`Failed to update prompt: ${res.statusText}`);
  return res.json();
}
