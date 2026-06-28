import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

const App = () => {
    const [nodes, setNodes] = useState([]);
    const [nextNodeId, setNextNodeId] = useState(1);
    const [showNodeInput, setShowNodeInput] = useState(false);
    const [newNodeValue, setNewNodeValue] = useState('');
    const [runTime, setRunTime] = useState('');

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


    // Add a new node
    const addNode = () => {
        const value = parseInt(newNodeValue);
        if (isNaN(value)) {
            alert('Please enter a valid integer');
            return;
        }
        setNodes([
            ...nodes,
            {
                id: nextNodeId,
                nodeNumber: value,
                spikes: [],
            },
        ]);
        setNextNodeId(nextNodeId + 1);
        setNewNodeValue('');
        setShowNodeInput(false);
    };

    // Remove a node
    const removeNode = (nodeId) => {
        setNodes(nodes.filter((node) => node.id !== nodeId));
    };

    // Add a spike pair to a node
    const addSpike = (nodeId) => {
        setNodes(
            nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        spikes: [
                            ...node.spikes,
                            { id: Date.now() + Math.random(), time: '', value: '' },
                        ],
                    };
                }
                return node;
            })
        );
    };

    // Remove a spike pair from a node
    const removeSpike = (nodeId, spikeId) => {
        setNodes(
            nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        spikes: node.spikes.filter((spike) => spike.id !== spikeId),
                    };
                }
                return node;
            })
        );
    };

    // Update spike time or value
    const updateSpike = (nodeId, spikeId, field, value) => {
        setNodes(
            nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        spikes: node.spikes.map((spike) => {
                            if (spike.id === spikeId) {
                                return { ...spike, [field]: value };
                            }
                            return spike;
                        }),
                    };
                }
                return node;
            })
        );
    };

    // Download all spikes as a .txt file with validation
    const downloadSpikes = () => {
        // 1. Check Run Time
        if (runTime.trim() === '') {
            alert('Please enter a Run Time.');
            return;
        }
        const runValue = parseInt(runTime, 10);
        if (isNaN(runValue)) {
            alert('Run Time must be a valid integer.');
            return;
        }

        // 2. Check each node
        for (const node of nodes) {
            if (node.spikes.length === 0) {
                alert(`Node ${node.nodeNumber} has no spike pairs. Please add at least one pair.`);
                return;
            }
            for (const spike of node.spikes) {
                if (spike.time.trim() === '' || spike.value.trim() === '') {
                    alert(`Node ${node.nodeNumber} has a spike pair with missing Time or Value. Please fill all fields.`);
                    return;
                }
            }
        }

        // 3. Build file content
        const lines = [];
        nodes.forEach((node) => {
            node.spikes.forEach((spike) => {
                lines.push(`AS ${node.nodeNumber} ${spike.time.trim()} ${spike.value.trim()}`);
            });
        });

        lines.push(`RUN ${runValue}`);
        lines.push('GSR');
        lines.push('OLF');
        lines.push('OC');
        lines.push('OT');
        lines.push('NCH');
        lines.push('NLFJ');
        lines.push('NCJ');
        lines.push('NCHJ');

        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spikes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
        <div className="app">
            <h1>Design Sparse Input Spike</h1>

            <div className="controls">
                {!showNodeInput ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowNodeInput(true)}
                        >
                            + Add Input Node
                        </button>
                        {nodes.length > 0 && (
                            <>
                                <input
                                    type="number"
                                    placeholder="Run Time"
                                    value={runTime}
                                    onChange={(e) => setRunTime(e.target.value)}
                                    style={{
                                        padding: '10px 14px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        width: '140px',
                                        background: 'white',
                                    }}
                                    onFocus={(e) => e.target.select()}
                                />
                                <button
                                    className="btn btn-success"
                                    onClick={downloadSpikes}
                                >
                                    Download Spikes
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="node-input-container">
                        <input
                            type="number"
                            placeholder="Enter input node ID"
                            value={newNodeValue}
                            onChange={(e) => setNewNodeValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addNode();
                                if (e.key === 'Escape') {
                                    setShowNodeInput(false);
                                    setNewNodeValue('');
                                }
                            }}
                            autoFocus
                        />
                        <button className="btn btn-success" onClick={addNode}>
                            Add
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowNodeInput(false);
                                setNewNodeValue('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {nodes.length === 0 ? (
                <div className="empty-state">
                    <p>No nodes added yet. Click "Add Input Node" to get started.</p>
                </div>
            ) : (
                <div className="nodes-container">
                    {nodes.map((node) => (
                        <div key={node.id} className="node-card">
                            <div className="node-header">
                                <h2>Input Node ID: {node.nodeNumber}</h2>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeNode(node.id)}
                                >
                                    Remove Node
                                </button>
                            </div>

                            <div className="spikes-container">
                                {node.spikes.length === 0 ? (
                                    <p className="no-spikes">
                                        No spike pairs. Add one below.
                                    </p>
                                ) : (
                                    <table className="spikes-table">
                                        <thead>
                                            <tr>
                                                <th>Spike Time</th>
                                                <th>Spike Value</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {node.spikes.map((spike) => (
                                                <tr key={spike.id}>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            placeholder="Time"
                                                            value={spike.time}
                                                            onChange={(e) =>
                                                                updateSpike(
                                                                    node.id,
                                                                    spike.id,
                                                                    'time',
                                                                    e.target.value
                                                                )
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.target.blur();
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            placeholder="Value"
                                                            value={spike.value}
                                                            onChange={(e) =>
                                                                updateSpike(
                                                                    node.id,
                                                                    spike.id,
                                                                    'value',
                                                                    e.target.value
                                                                )
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.target.blur();
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            style={{ whiteSpace: 'nowrap' }}
                                                            onClick={() => removeSpike(node.id, spike.id)}
                                                        >
                                                            Remove Spike
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                <button
                                    className="btn btn-secondary btn-sm add-spike-btn"
                                    onClick={() => addSpike(node.id)}
                                >
                                    + Add Spike
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        </>
    );
};

export default App;