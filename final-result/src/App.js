// App.js
import React, { useState } from 'react';
import './App.css';

function App() {
  const [networkFile, setNetworkFile] = useState(null);
  const [spikeFile, setSpikeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  const handleNetworkChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'text/plain') {
      setNetworkFile(selected);
      setError('');
      setSuccess('');
    } else {
      setNetworkFile(null);
      setError('Please select a .txt file for Network Define');
      setSuccess('');
    }
  };

  const handleSpikeChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'text/plain') {
      setSpikeFile(selected);
      setError('');
      setSuccess('');
    } else {
      setSpikeFile(null);
      setError('Please select a .txt file for Input Spike Define');
      setSuccess('');
    }
  };

  const handleProcess = async () => {
    if (!networkFile || !spikeFile) {
      setError('Please select both files');
      setSuccess('');
      return;
    }

    const formData = new FormData();
    formData.append('network_file', networkFile);
    formData.append('spike_file', spikeFile);

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Processing failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'results.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Processing complete — ZIP downloaded.');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <a
        href="https://neuromorphic-processor-ui-7whm.vercel.app/"
        className="home-btn"
        aria-label="Home"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </a>

      <div className="app-card">
        <div className="app-header">
          <h1>Run Simulation</h1>
          
        </div>

        <div className="upload-section">
          <div className="label-row">
            <label htmlFor="network-input">Network Defining File</label>
            <span className="file-hint">.txt</span>
          </div>
          <div className="file-input-wrap">
            <input
              id="network-input"
              type="file"
              accept=".txt"
              onChange={handleNetworkChange}
              disabled={loading}
            />
            <label htmlFor="network-input" className="file-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              Choose file
            </label>
            <span className={`file-name ${!networkFile ? 'empty' : ''}`}>
              {networkFile ? networkFile.name : 'No file selected'}
            </span>
          </div>
        </div>

        <div className="upload-section">
          <div className="label-row">
            <label htmlFor="spike-input">Input Spike Defining File</label>
            <span className="file-hint">.txt</span>
          </div>
          <div className="file-input-wrap">
            <input
              id="spike-input"
              type="file"
              accept=".txt"
              onChange={handleSpikeChange}
              disabled={loading}
            />
            <label htmlFor="spike-input" className="file-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              Choose file
            </label>
            <span className={`file-name ${!spikeFile ? 'empty' : ''}`}>
              {spikeFile ? spikeFile.name : 'No file selected'}
            </span>
          </div>
        </div>

        <div className="action-row">
          <button
            className="btn-process"
            onClick={handleProcess}
            disabled={!networkFile || !spikeFile || loading}
          >
            {loading && <span className="spinner"></span>}
            {loading ? 'Processing…' : 'Process Files'}
          </button>

          <div className="status-message">
            {error && <span className="error">{error}</span>}
            {success && <span className="success">{success}</span>}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;