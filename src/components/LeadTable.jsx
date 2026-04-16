export default function LeadTable({ leads, selected, onToggle, onToggleAll }) {
  if (!leads.length) return null;

  const allSelected = leads.length > 0 && selected.size === leads.length;

  return (
    <div className="lead-table-wrapper">
      <table className="lead-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleAll(!allSelected)}
              />
            </th>
            <th>Name</th>
            <th>Title</th>
            <th>Company</th>
            <th>Industry</th>
            <th>Country</th>
            <th>Seniority</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            const p = lead.payload || lead;
            return (
              <tr key={`${p.email}-${i}`}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={() => onToggle(i)}
                  />
                </td>
                <td>{p.first_name} {p.last_name}</td>
                <td>{p.title}</td>
                <td>{p.company_name}</td>
                <td>{p.industry}</td>
                <td>{p.country}</td>
                <td>{p.seniority}</td>
                <td>{p.email}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
