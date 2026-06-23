import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use environment variable (must start with REACT_APP_)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'text/plain') {
      setFile(selected);
      setError('');
    } else {
      setFile(null);
      setError('Please select a .txt file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Processing failed');
      }

      // Convert response to a Blob and trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'out.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', textAlign: 'center' }}>
      <h1>TXT Processor</h1>
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        disabled={loading}
      />
      <br /><br />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{ padding: '8px 24px' }}
      >
        {loading ? 'Processing...' : 'Upload & Process'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {file && !error && <p>Selected: {file.name}</p>}
    </div>
  );
}

export default App;