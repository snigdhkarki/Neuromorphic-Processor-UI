import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Hardcoded list of available empty network files (must match names in public/emptyNets/)
const EMPTY_NET_FILES = [
  'risp_f_plus_empty.txt',
  'risp_f_empty.txt',
  'risp_255_plus_empty.txt',
  'risp_127_empty.txt',
  'risp_15_plus_empty.txt',
  'risp_7_empty.txt',
  'risp_1_plus_empty.txt',
  'risp_1_empty.txt',
];

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mode, setMode] = useState('idle');
  const [edgeSource, setEdgeSource] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [logs, setLogs] = useState([]); // { raw, timestamp }
    const [selectedFile, setSelectedFile] = useState('risp_1_empty.txt');

  const svgRef = useRef(null);
  const dragRef = useRef({ nodeId: null, offsetX: 0, offsetY: 0 });
  const isDraggingRef = useRef(false);
  const logContainerRef = useRef(null);

  // ---- Auto-scroll log to bottom ----
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // ---- Log helper ----
  const addLog = (raw) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { raw, timestamp }]);
  };

  // ---- Download log ----
  const downloadLog = async () => {
    if (!selectedFile) {
      alert('Please select a file from the dropdown.');
      return;
    }
    if (logs.length === 0) {
      alert('No logs to download.');
      return;
    }

    try {
      // Fetch the selected empty network file from public/emptyNets/
      const response = await fetch(`/emptyNets/${selectedFile}`);
      if (!response.ok) throw new Error('Failed to fetch file');
      const fileContent = await response.text();

      // Build the raw log content (no timestamps)
      const logContent = logs.map((entry) => entry.raw).join('\n');

      // Combine: file content + logs + termination line
      const finalContent = `FJ\n${fileContent}\n${logContent}\nTJ tmp_net.txt`;

      // Download as network_tool_prompt.txt
      const blob = new Blob([finalContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'network_tool_prompt.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Error downloading: ${error.message}`);
    }
  };

  // ---- Helpers (unchanged) ----
  const getSvgCoordinates = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const nodeHasEdges = (nodeId) => {
    return edges.some((e) => e.source === nodeId || e.target === nodeId);
  };

  const getEdgeEndpoints = (sourceNode, targetNode) => {
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = 18;
    const margin = 2;
    const shorten = radius + margin;

    let endX = targetNode.x;
    let endY = targetNode.y;
    if (distance > shorten) {
      const ratio = (distance - shorten) / distance;
      endX = sourceNode.x + dx * ratio;
      endY = sourceNode.y + dy * ratio;
    }
    return { x1: sourceNode.x, y1: sourceNode.y, x2: endX, y2: endY };
  };

  // ---- Mouse drag ----
  const handleMouseMove = (e) => {
    if (dragRef.current.nodeId === null) return;
    isDraggingRef.current = true;
    const svgCoords = getSvgCoordinates(e);
    const { nodeId, offsetX, offsetY } = dragRef.current;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? { ...n, x: svgCoords.x + offsetX, y: svgCoords.y + offsetY }
          : n
      )
    );
  };

  const handleMouseUp = () => {
    dragRef.current.nodeId = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // ---- Click handlers (unchanged except log formats) ----
  const handleSvgClick = (e) => {
    if (mode === 'addingNode') {
      const { x, y } = getSvgCoordinates(e);
      const newNode = {
        id: nextId,
        x,
        y,
        input: false,
        output: false,
        label: '',
        properties: {},
      };
      setNodes([...nodes, newNode]);
      addLog(`AN ${nextId}`);
      setNextId(nextId + 1);
    }
    if (mode === 'addingEdge' && edgeSource !== null) {
      setEdgeSource(null);
    }
  };

  const handleNodeClick = (nodeId) => (e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    if (mode === 'addingEdge') {
      if (edgeSource === null) {
        setEdgeSource(nodeId);
      } else {
        const sourceId = edgeSource;
        const targetId = nodeId;
        const alreadyExists = edges.some(
          (e) => e.source === sourceId && e.target === targetId
        );
        if (alreadyExists) {
          alert(`Edge from ${sourceId} to ${targetId} already exists.`);
        } else {
          setEdges([...edges, { source: sourceId, target: targetId, properties: {} }]);
          addLog(`AE ${sourceId} ${targetId}`);
        }
        setEdgeSource(null);
      }
    } 
    else if (mode === 'deleteNode') {
      if (node.input || node.output) {
        alert('Cannot delete a node that is marked as input or output.');
      } else if (nodeHasEdges(nodeId)) {
        alert('Cannot delete node – it still has edges (incoming or outgoing).');
      } else {
        setNodes(nodes.filter((n) => n.id !== nodeId));
        addLog(`RN ${nodeId}`);
        setMode('idle');
      }
    }
    else if (mode === 'setInput') {
      if (node.input) {
        alert('Node is already set as input.');
      } else if (node.output) {
        alert('This node is already set as output. Cannot set as input.');
      } else {
        const updated = nodes.map((n) =>
          n.id === nodeId ? { ...n, input: true } : n
        );
        setNodes(updated);
        addLog(`AI ${nodeId}`);
        setMode('idle');
      }
    }
    else if (mode === 'setOutput') {
      if (node.output) {
        alert('Node is already set as output.');
      } else if (node.input) {
        alert('This node is already set as input. Cannot set as output.');
      } else {
        const updated = nodes.map((n) =>
          n.id === nodeId ? { ...n, output: true } : n
        );
        setNodes(updated);
        addLog(`AO ${nodeId}`);
        setMode('idle');
      }
    }
    else if (mode === 'renameNode') {
      const currentLabel = node.label || '';
      const newLabel = prompt(`Enter new name for node ${node.id}:`, currentLabel);
      if (newLabel !== null) {
        const trimmed = newLabel.trim();
        const updated = nodes.map((n) =>
          n.id === nodeId ? { ...n, label: trimmed } : n
        );
        setNodes(updated);
        addLog(`SETNAME ${nodeId} ${trimmed || nodeId}`);
      }
      setMode('idle');
    }
    else if (mode === 'addNodeProp') {
      const key = prompt('Enter property name:');
      if (key !== null && key.trim() !== '') {
        const value = prompt(`Enter value for "${key}":`);
        if (value !== null) {
          const trimmedKey = key.trim();
          const trimmedValue = value.trim() || '';
          const updated = nodes.map((n) =>
            n.id === nodeId
              ? { ...n, properties: { ...n.properties, [trimmedKey]: trimmedValue } }
              : n
          );
          setNodes(updated);
          addLog(`SNP ${nodeId} ${trimmedKey} ${trimmedValue}`);
        }
      }
      setMode('idle');
    }
  };

  const handleNodeMouseDown = (nodeId) => (e) => {
    if (mode !== 'idle') return;
    e.preventDefault();
    const svgCoords = getSvgCoordinates(e);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    dragRef.current = {
      nodeId,
      offsetX: node.x - svgCoords.x,
      offsetY: node.y - svgCoords.y,
    };
    isDraggingRef.current = false;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleEdgeClick = (edgeIndex) => (e) => {
    e.stopPropagation();

    if (mode === 'deleteEdge') {
      const edge = edges[edgeIndex];
      setEdges(edges.filter((_, idx) => idx !== edgeIndex));
      addLog(`RE ${edge.source} ${edge.target}`);
      setMode('idle');
    }
    else if (mode === 'addEdgeProp') {
      const edge = edges[edgeIndex];
      if (!edge) return;
      const key = prompt('Enter property name:');
      if (key !== null && key.trim() !== '') {
        const value = prompt(`Enter value for "${key}":`);
        if (value !== null) {
          const trimmedKey = key.trim();
          const trimmedValue = value.trim() || '';
          const updatedEdges = edges.map((e, idx) =>
            idx === edgeIndex
              ? { ...e, properties: { ...e.properties, [trimmedKey]: trimmedValue } }
              : e
          );
          setEdges(updatedEdges);
          addLog(`SEP ${edge.source} ${edge.target} ${trimmedKey} ${trimmedValue}`);
        }
      }
      setMode('idle');
    }
  };

  // ---- Mode controls ----
  const startAddNode = () => {
    setMode('addingNode');
    setEdgeSource(null);
  };

  const startAddEdge = () => {
    setMode('addingEdge');
    setEdgeSource(null);
  };

  const startDeleteEdge = () => {
    setMode('deleteEdge');
    setEdgeSource(null);
  };

  const startDeleteNode = () => {
    setMode('deleteNode');
    setEdgeSource(null);
  };

  const startSetInput = () => {
    setMode('setInput');
    setEdgeSource(null);
  };

  const startSetOutput = () => {
    setMode('setOutput');
    setEdgeSource(null);
  };

  const startRenameNode = () => {
    setMode('renameNode');
    setEdgeSource(null);
  };

  const startAddNodeProp = () => {
    setMode('addNodeProp');
    setEdgeSource(null);
  };

  const startAddEdgeProp = () => {
    setMode('addEdgeProp');
    setEdgeSource(null);
  };

  const cancelMode = () => {
    setMode('idle');
    setEdgeSource(null);
  };

  // ---- Helpers for tooltip ----
  const formatProperties = (props) => {
    const entries = Object.entries(props);
    if (entries.length === 0) return 'No properties';
    return entries.map(([k, v]) => `${k}: ${v}`).join('\n');
  };

  // ---- Render ----
  return (
    <div className="app">
    <div className="toolbar" style={{ flexWrap: 'wrap' }}>
  {/* TOP ROW: Buttons and Controls */}
  <div className="toolbar-controls" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
    <button onClick={startAddNode} className={mode === 'addingNode' ? 'active' : ''}>
      Add Node
    </button>
    <button onClick={startAddEdge} className={mode === 'addingEdge' ? 'active' : ''}>
      Add Edge
    </button>
    <button onClick={startDeleteEdge} className={mode === 'deleteEdge' ? 'active' : ''}>
      Delete Edge
    </button>
    <button onClick={startDeleteNode} className={mode === 'deleteNode' ? 'active' : ''}>
      Delete Node
    </button>
    <button onClick={startSetInput} className={mode === 'setInput' ? 'active' : ''}>
      Set Input
    </button>
    <button onClick={startSetOutput} className={mode === 'setOutput' ? 'active' : ''}>
      Set Output
    </button>
    <button onClick={startRenameNode} className={mode === 'renameNode' ? 'active' : ''}>
      Rename Node
    </button>
    <button onClick={startAddNodeProp} className={mode === 'addNodeProp' ? 'active' : ''}>
      Add Node Prop
    </button>
    <button onClick={startAddEdgeProp} className={mode === 'addEdgeProp' ? 'active' : ''}>
      Add Edge Prop
    </button>

    {/* Dropdown for empty network file */}
    <select
      value={selectedFile}
      onChange={(e) => setSelectedFile(e.target.value)}
      className="file-select"
    >
      {EMPTY_NET_FILES.map((file) => (
        <option key={file} value={file}>
          {file}
        </option>
      ))}
    </select>

    <button onClick={downloadLog} className="download-log">
      Download Log
    </button>

    {mode !== 'idle' && (
      <button onClick={cancelMode} className="cancel">
        Cancel
      </button>
    )}
  </div>

  {/* BOTTOM ROW: Status Text */}
  <div className="toolbar-status" style={{ width: '100%', marginTop: '10px' }}>
    <span className="status">
      {mode === 'addingNode' && 'Click on the window to place a node.'}
      {mode === 'addingEdge' && (
        edgeSource === null
          ? 'Click a source node (click again for self‑edge).'
          : `Click a target node or same node for self‑edge.`
      )}
      {mode === 'deleteEdge' && 'Click on an edge to delete it.'}
      {mode === 'deleteNode' && 'Click a node to delete it (only if it has no edges and is not an input/output).'}
      {mode === 'setInput' && 'Click a node to set it as input (green). Nodes already input or output cannot be changed.'}
      {mode === 'setOutput' && 'Click a node to set it as output (red). Nodes already output or input cannot be changed.'}
      {mode === 'renameNode' && 'Click a node to rename it.'}
      {mode === 'addNodeProp' && 'Click a node to add a property.'}
      {mode === 'addEdgeProp' && 'Click an edge to add a property.'}
      {mode === 'idle' && 'Select a tool from the buttons above.'}
    </span>
  </div>
</div>

      <div className="canvas-wrapper">
        <svg ref={svgRef} className="canvas" onClick={handleSvgClick}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>

          {/* Edges (unchanged) */}
          {edges.map((edge, idx) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const propTooltip = `Edge ${sourceNode.label || sourceNode.id} → ${targetNode.label || targetNode.id}\nProperties:\n${formatProperties(edge.properties)}`;

            if (sourceNode.id === targetNode.id) {
              const x = sourceNode.x;
              const y = sourceNode.y;
              const radius = 18;
              const loopWidth = 90;
              const loopHeight = 90;
              const startX = x + radius + 4;
              const startY = y;
              const endX = x - radius - 4;
              const endY = y;
              const cp1x = x + radius + loopWidth;
              const cp1y = y - loopHeight;
              const cp2x = x - radius - loopWidth;
              const cp2y = y - loopHeight;
              const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

              return (
                <g key={`edge-${idx}`} onClick={handleEdgeClick(idx)} style={{ cursor: mode === 'deleteEdge' || mode === 'addEdgeProp' ? 'pointer' : 'default' }}>
                  <path d={d} stroke="transparent" strokeWidth="12" fill="none" />
                  <path d={d} stroke="#666" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                  <title>{propTooltip}</title>
                </g>
              );
            }

            const { x1, y1, x2, y2 } = getEdgeEndpoints(sourceNode, targetNode);
            const reverseExists = edges.some(
              (e) => e.source === edge.target && e.target === edge.source
            );

            let pathData = null;
            if (reverseExists) {
              const curveOffset = 30;
              const id1 = Math.min(edge.source, edge.target);
              const id2 = Math.max(edge.source, edge.target);
              const node1 = nodes.find((n) => n.id === id1);
              const node2 = nodes.find((n) => n.id === id2);
              if (node1 && node2) {
                const dxFixed = node2.x - node1.x;
                const dyFixed = node2.y - node1.y;
                const lenFixed = Math.sqrt(dxFixed * dxFixed + dyFixed * dyFixed);
                if (lenFixed > 0) {
                  const perpX = -dyFixed / lenFixed;
                  const perpY = dxFixed / lenFixed;
                  const sign = edge.source === id1 ? 1 : -1;
                  const midX = (sourceNode.x + targetNode.x) / 2;
                  const midY = (sourceNode.y + targetNode.y) / 2;
                  const ctrlX = midX + sign * curveOffset * perpX;
                  const ctrlY = midY + sign * curveOffset * perpY;
                  pathData = `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
                }
              }
            }

            if (pathData) {
              return (
                <g key={`edge-${idx}`} onClick={handleEdgeClick(idx)} style={{ cursor: mode === 'deleteEdge' || mode === 'addEdgeProp' ? 'pointer' : 'default' }}>
                  <path d={pathData} stroke="transparent" strokeWidth="12" fill="none" />
                  <path d={pathData} stroke="#666" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                  <title>{propTooltip}</title>
                </g>
              );
            } else {
              return (
                <g key={`edge-${idx}`} onClick={handleEdgeClick(idx)} style={{ cursor: mode === 'deleteEdge' || mode === 'addEdgeProp' ? 'pointer' : 'default' }}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="12" />
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <title>{propTooltip}</title>
                </g>
              );
            }
          })}

          {/* Nodes (unchanged) */}
          {nodes.map((node) => {
            const isSource = edgeSource === node.id;
            let fillColor = '#a6bfd9';
            if (node.input) fillColor = '#2ecc71';
            if (node.output) fillColor = '#e74c3c';

            let strokeColor = '#2c5f8a';
            if (node.input) strokeColor = '#27ae60';
            if (node.output) strokeColor = '#c0392b';
            if (isSource) {
              fillColor = '#ffaa66';
              strokeColor = '#cc7a22';
            }

            let cursor = 'default';
            if (mode === 'idle') {
              cursor = dragRef.current.nodeId === node.id ? 'grabbing' : 'grab';
            } else if (
              mode === 'deleteNode' ||
              mode === 'setInput' ||
              mode === 'setOutput' ||
              mode === 'addingEdge' ||
              mode === 'renameNode' ||
              mode === 'addNodeProp'
            ) {
              cursor = 'pointer';
            }

            const displayText = node.label || node.id;
            const propTooltip = `Node ${displayText}\nProperties:\n${formatProperties(node.properties)}`;

            return (
              <g
                key={node.id}
                onClick={handleNodeClick(node.id)}
                onMouseDown={handleNodeMouseDown(node.id)}
                style={{ cursor }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="18"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy=".35em"
                  fill="black"
                  fontSize="12"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {displayText}
                </text>
                <title>{propTooltip}</title>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="log-container" ref={logContainerRef}>
        <div className="log-header">Activity Log</div>
        <div className="log-content">
          {logs.length === 0 ? (
            <div className="log-empty">No activity yet</div>
          ) : (
            logs.map((entry, i) => (
               <div key={i} className="log-entry">{entry.raw}</div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;