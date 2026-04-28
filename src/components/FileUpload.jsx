import { useRef, useState } from 'react';
import { uploadCSV } from '../api';

export default function FileUpload() {
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);

    try {
      const data = await uploadCSV(file);
      setStatus({ ok: true, message: data.message });
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <h3>Upload Leads CSV</h3>
      <p className="file-upload-description">
        Here you can upload your leads for us to find similarities in our database and enhance the results.
      </p>
      <div className="file-upload-row">
        <input type="file" accept=".csv" ref={fileRef} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading…' : 'Upload & Enhance'}
        </button>
      </div>
      {status && (
        <p className={status.ok ? 'status-ok' : 'status-err'}>
          {status.message}
        </p>
      )}
    </div>
  );
}
