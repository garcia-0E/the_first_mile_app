import { useLocation, Link } from 'react-router-dom';
import DraftTable from '../components/DraftTable';

export default function Drafts() {
  const { state } = useLocation();
  const drafts = state?.drafts || [];

  const handleSendToApollo = async (draft) => {
    // TODO: integrate with Apollo API
    console.log('Sending to Apollo:', draft.lead?.email);
    alert(`Draft for ${draft.lead?.first_name} ${draft.lead?.last_name} sent to Apollo.`);
  };

  return (
    <div className="page">
      <h2>Generated Drafts</h2>

      <Link to="/">&larr; Back to Suggester</Link>

      <DraftTable drafts={drafts} onSendToApollo={handleSendToApollo} />
    </div>
  );
}
