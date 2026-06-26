import React, { useState, useRef } from 'react';
import './App.css';
import { EMPTY_NET_FILES } from './constants';
import { getSvgCoordinates, nodeHasEdges } from './utils';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import LogPanel from './components/LogPanel';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mode, setMode] = useState('idle');
  const [edgeSource, setEdgeSource] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [logs, setLogs] = useState([]);
  const [selectedFile, setSelectedFile] = useState('risp_1_empty.txt');

  const svgRef = useRef(null);
  const dragRef = useRef({ nodeId: null, offsetX: 0, offsetY: 0 });
  const isDraggingRef = useRef(false);

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
      const response = await fetch(`/emptyNets/${selectedFile}`);
      if (!response.ok) throw new Error('Failed to fetch file');
      const fileContent = await response.text();
      const logContent = logs.map((entry) => entry.raw).join('\n');
      const finalContent = `FJ\n${fileContent}\n${logContent}\nTJ`;
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

  // ---- Mouse drag ----
  const handleMouseMove = (e) => {
    if (dragRef.current.nodeId === null) return;
    isDraggingRef.current = true;
    const svg = svgRef.current;
    if (!svg) return;
    const svgCoords = getSvgCoordinates(svg, e);
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

  // ---- Click handlers ----
  const handleSvgClick = (e) => {
    if (mode === 'addingNode') {
      const svg = svgRef.current;
      if (!svg) return;
      const { x, y } = getSvgCoordinates(svg, e);
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
      } else if (nodeHasEdges(nodeId, edges)) {
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
    const svg = svgRef.current;
    if (!svg) return;
    const svgCoords = getSvgCoordinates(svg, e);
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

  // ---- Status message ----
  const getStatusMessage = () => {
    if (mode === 'addingNode') return 'Click on the window to place a node.';
    if (mode === 'addingEdge') {
      return edgeSource === null
        ? 'Click a source node (click again for self‑edge).'
        : 'Click a target node or same node for self‑edge.';
    }
    if (mode === 'deleteEdge') return 'Click on an edge to delete it.';
    if (mode === 'deleteNode') return 'Click a node to delete it (only if it has no edges and is not an input/output).';
    if (mode === 'setInput') return 'Click a node to set it as input (green). Nodes already input or output cannot be changed.';
    if (mode === 'setOutput') return 'Click a node to set it as output (red). Nodes already output or input cannot be changed.';
    if (mode === 'renameNode') return 'Click a node to rename it.';
    if (mode === 'addNodeProp') return 'Click a node to add a property.';
    if (mode === 'addEdgeProp') return 'Click an edge to add a property.';
    return 'Select a tool from the buttons above.';
  };

  const draggingNodeId = dragRef.current.nodeId;

  return (
    <div className="app">
      <Toolbar
        mode={mode}
        selectedFile={selectedFile}
        onFileChange={(e) => setSelectedFile(e.target.value)}
        onDownload={downloadLog}
        onCancel={cancelMode}
        onStartAddNode={startAddNode}
        onStartAddEdge={startAddEdge}
        onStartDeleteEdge={startDeleteEdge}
        onStartDeleteNode={startDeleteNode}
        onStartSetInput={startSetInput}
        onStartSetOutput={startSetOutput}
        onStartRenameNode={startRenameNode}
        onStartAddNodeProp={startAddNodeProp}
        onStartAddEdgeProp={startAddEdgeProp}
        statusMessage={getStatusMessage()}
        emptyNetFiles={EMPTY_NET_FILES}
      />
      <div className="canvas-wrapper">
        <Canvas
          svgRef={svgRef}
          nodes={nodes}
          edges={edges}
          mode={mode}
          edgeSource={edgeSource}
          draggingNodeId={draggingNodeId}
          onSvgClick={handleSvgClick}
          onNodeClick={handleNodeClick}
          onNodeMouseDown={handleNodeMouseDown}
          onEdgeClick={handleEdgeClick}
        />
      </div>
      <LogPanel logs={logs} />
    </div>
  );
}

export default App;