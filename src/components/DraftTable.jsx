import { useState } from 'react';

export default function DraftTable({ drafts, onSendToApollo }) {
  const [sending, setSending] = useState(new Set());

  if (!drafts.length) return <p>No drafts to display.</p>;

  const handleSend = async (draft, index) => {
    setSending((prev) => new Set(prev).add(index));
    try {
      await onSendToApollo(draft);
    } finally {
      setSending((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  return (
    <div className="draft-table-wrapper">
      <table className="draft-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Title</th>
            <th>Draft</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((d, i) => {
            const lead = d.lead || {};
            return (
              <tr key={lead.email || i}>
                <td>{lead.first_name} {lead.last_name}</td>
                <td>{lead.company_name}</td>
                <td>{lead.title}</td>
                <td className="draft-cell">
                  {d.draft ? (
                    <pre>{d.draft}</pre>
                  ) : (
                    <em>Generation failed</em>
                  )}
                </td>
                <td>
                  <button
                    className="btn-apollo"
                    disabled={!d.draft || sending.has(i)}
                    onClick={() => handleSend(d, i)}
                  >
                    {sending.has(i) ? 'Sending…' : 'Send to Apollo'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
