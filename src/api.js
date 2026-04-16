const BASE = '/api';

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

export async function searchPartners({ query, country, seniority, top_k }) {
  const res = await fetch(`${BASE}/suggester`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, country, seniority, top_k }),
  });

  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  return res.json();
}

export async function generateDrafts(leads, context) {
  const res = await fetch(`${BASE}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads, context }),
  });

  if (!res.ok) throw new Error(`Draft generation failed: ${res.statusText}`);
  return res.json();
}
