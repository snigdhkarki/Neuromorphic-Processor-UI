import React from 'react';

const Toolbar = ({
  mode,
  selectedFile,
  onFileChange,
  onDownload,
  onCancel,
  onStartAddNode,
  onStartAddEdge,
  onStartDeleteEdge,
  onStartDeleteNode,
  onStartSetInput,
  onStartSetOutput,
  onStartRenameNode,
  onStartAddNodeProp,
  onStartAddEdgeProp,
  statusMessage,
  emptyNetFiles,
}) => {
  return (
    <div className="toolbar" style={{ flexWrap: 'wrap' }}>
      <div className="toolbar-controls" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={onStartAddNode} className={mode === 'addingNode' ? 'active' : ''}>
          Add Node
        </button>
        <button onClick={onStartAddEdge} className={mode === 'addingEdge' ? 'active' : ''}>
          Add Edge
        </button>
        <button onClick={onStartDeleteEdge} className={mode === 'deleteEdge' ? 'active' : ''}>
          Delete Edge
        </button>
        <button onClick={onStartDeleteNode} className={mode === 'deleteNode' ? 'active' : ''}>
          Delete Node
        </button>
        <button onClick={onStartSetInput} className={mode === 'setInput' ? 'active' : ''}>
          Set Input
        </button>
        <button onClick={onStartSetOutput} className={mode === 'setOutput' ? 'active' : ''}>
          Set Output
        </button>
        <button onClick={onStartRenameNode} className={mode === 'renameNode' ? 'active' : ''}>
          Rename Node
        </button>
        <button onClick={onStartAddNodeProp} className={mode === 'addNodeProp' ? 'active' : ''}>
          Add Node Prop
        </button>
        <button onClick={onStartAddEdgeProp} className={mode === 'addEdgeProp' ? 'active' : ''}>
          Add Edge Prop
        </button>

        <select value={selectedFile} onChange={onFileChange} className="file-select">
          {emptyNetFiles.map((file) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>

        <button onClick={onDownload} className="download-log">
          Download Log
        </button>

        {mode !== 'idle' && (
          <button onClick={onCancel} className="cancel">
            Cancel
          </button>
        )}
      </div>

      <div className="toolbar-status" style={{ width: '100%', marginTop: '10px' }}>
        <span className="status">{statusMessage}</span>
      </div>
    </div>
  );
};

export default Toolbar;