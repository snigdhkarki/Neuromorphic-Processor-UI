import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

// Helper: generate a short unique ID
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function App() {
  const [nodes, setNodes] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [runtime, setRuntime] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const pingBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/ping`);
        if (response.ok){
        console.log('ping successful');
      }
      } catch (err) {
        // Silently ignore – just a warm‑up call
        console.log('Backend ping failed:', err);
      }
    };

    // Immediate ping on mount
    pingBackend();

    // Set up interval
    const intervalId = setInterval(pingBackend, 60000); // 60 seconds

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);


  // Auto-focus the input on mount
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Add a new node
  const addNode = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const exists = nodes.some(n => n.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert(`A node named "${trimmed}" already exists. Please choose a unique name.`);
      return;
    }

    const newNode = {
      id: uid(),
      name: trimmed,
      bits: [],
    };
    setNodes(prev => [...prev, newNode]);
    setInputValue('');
    if (inputRef.current) inputRef.current.focus();
  }, [inputValue, nodes]);

  // Append a bit
  const appendBit = useCallback((nodeId, bit) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === nodeId
          ? { ...node, bits: [...node.bits, bit] }
          : node
      )
    );
  }, []);

  // Backspace
  const removeLastBit = useCallback((nodeId) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === nodeId && node.bits.length > 0
          ? { ...node, bits: node.bits.slice(0, -1) }
          : node
      )
    );
  }, []);

  // Remove a node
  const removeNode = useCallback((nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
  }, []);

  // Handle Enter key on input
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNode();
    }
  }, [addNode]);

  // ----- Download handler -----
  const handleDownload = useCallback(() => {
    // Validate runtime
    const runtimeInt = parseInt(runtime, 10);
    if (isNaN(runtimeInt) || runtimeInt < 0) {
      alert('Please enter a valid integer for Run Time.');
      return;
    }

    // Check all nodes have at least one bit
    const allHaveBits = nodes.every(node => node.bits.length > 0);
    if (!allHaveBits) {
      alert('All nodes must have at least one bit (0 or 1) to download.');
      return;
    }

    // Build content
    let content = '';
    nodes.forEach(node => {
      const raster = node.bits.join('');
      content += `ASR ${node.name} ${raster}\n`;
    });
    content += `RUN ${runtimeInt}\n`;
    content += 'GSR \n';
content += 'OLF \n';
content += 'OC \n';
content += 'OT \n';
content += 'NCH \n';
content += 'NLFJ \n';
content += 'NCJ \n';
content += 'NCHJ \n';

    // Create and download .txt file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spikes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, runtime]);

  // Check if download should be enabled
  const isDownloadEnabled = (() => {
    const runtimeInt = parseInt(runtime, 10);
    const isRuntimeValid = !isNaN(runtimeInt) && runtimeInt >= 0 && runtime.trim() !== '';
    const allHaveBits = nodes.length > 0 && nodes.every(node => node.bits.length > 0);
    return isRuntimeValid && allHaveBits;
  })();

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
    <div className="app">
      <h1>Design Dense Input Spike</h1>
       

      {/* ----- Add Node Area ----- */}
      <div className="add-area">
        <label htmlFor="nodeNameInput">Input Node ID:</label>
        <input
          id="nodeNameInput"
          ref={inputRef}
          type="text"
          placeholder=''
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn-primary" onClick={addNode} disabled={!inputValue.trim()}>
          ＋ Add Input Node
        </button>
      </div>

      {/* ----- Run Time & Download Area ----- */}
      <div className="download-area">
        <div className="runtime-group">
          <label htmlFor="runtimeInput">Run Time:</label>
          <input
            id="runtimeInput"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 100"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
          />
        </div>
        <button
          className="btn-download"
          onClick={handleDownload}
          disabled={!isDownloadEnabled}
        >
          Download .txt
        </button>
        {!isDownloadEnabled && nodes.length > 0 && (
          <span className="download-hint">
            {!runtime.trim() || isNaN(parseInt(runtime, 10))
              ? 'Enter a valid Run Time.'
              : 'All nodes must have at least one bit.'}
          </span>
        )}
      </div>

      {/* ----- Node List ----- */}
      {nodes.length === 0 ? (
        <div className="empty-state">
          <p>No input nodes yet.</p>
          <div className="hint">Add your first input node.</div>
        </div>
      ) : (
        <div className="node-list">
          {nodes.map((node) => {
            const bitString = node.bits.join('');
            const isEmpty = node.bits.length === 0;

            return (
              <div key={node.id} className="node-card">
                <span className="node-name">Input node ID: {node.name}</span>

                <span className={`node-bits ${isEmpty ? '' : ''}`}>
                  {!isEmpty && bitString}
                </span>

                <div className="node-actions">
                  <button
                    className="btn-bit one"
                    onClick={() => appendBit(node.id, '1')}
                    aria-label="Append 1"
                  >
                    1
                  </button>
                  <button
                    className="btn-bit zero"
                    onClick={() => appendBit(node.id, '0')}
                    aria-label="Append 0"
                  >
                    0
                  </button>

                  <button
                    className="btn-backspace"
                    onClick={() => removeLastBit(node.id)}
                    disabled={isEmpty}
                    aria-label="Backspace (remove last bit)"
                  >
                    ⌫
                  </button>

                  <button
                    className="btn-remove-node"
                    onClick={() => removeNode(node.id)}
                    aria-label="Remove this node"
                    title="Remove node"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}

export default App;