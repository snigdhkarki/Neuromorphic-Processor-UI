import React, { useState } from 'react';

function App() {
  const [networkFile, setNetworkFile] = useState(null);
  const [spikeFile, setSpikeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  const handleNetworkChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'text/plain') {
      setNetworkFile(selected);
      setError('');
    } else {
      setNetworkFile(null);
      setError('Please select a .txt file for Network Define');
    }
  };

  const handleSpikeChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'text/plain') {
      setSpikeFile(selected);
      setError('');
    } else {
      setSpikeFile(null);
      setError('Please select a .txt file for Input Spike Define');
    }
  };

  const handleProcess = async () => {
    if (!networkFile || !spikeFile) {
      setError('Please select both files');
      return;
    }

    const formData = new FormData();
    formData.append('network_file', networkFile);
    formData.append('spike_file', spikeFile);

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

      // Get the ZIP blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'results.zip';   // user gets a zip file
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
    <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
      <h1>TXT Processor</h1>

      <div style={{ margin: '20px 0' }}>
        <label><strong>Network Define</strong></label><br />
        <input
          type="file"
          accept=".txt"
          onChange={handleNetworkChange}
          disabled={loading}
        />
        {networkFile && <p>Selected: {networkFile.name}</p>}
      </div>

      <div style={{ margin: '20px 0' }}>
        <label><strong>Input Spike Define</strong></label><br />
        <input
          type="file"
          accept=".txt"
          onChange={handleSpikeChange}
          disabled={loading}
        />
        {spikeFile && <p>Selected: {spikeFile.name}</p>}
      </div>

      <button
        onClick={handleProcess}
        disabled={!networkFile || !spikeFile || loading}
        style={{ padding: '10px 30px' }}
      >
        {loading ? 'Processing...' : 'Process'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;