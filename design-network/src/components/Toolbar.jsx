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
  onStartSetAllNodeProp,
  onStartSetAllEdgeProp,
  statusMessage,
  emptyNetFiles,
}) => {
  return (
    <div className="toolbar" style={{ flexWrap: 'wrap' }}>
      <div className="toolbar-controls" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <a
          href="https://neuromorphic-processor-ui-7whm.vercel.app/"
          className="back-button"
          aria-label="Go back to home"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </a>
      

        
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
          Set Node Prop
        </button>
        <button onClick={onStartAddEdgeProp} className={mode === 'addEdgeProp' ? 'active' : ''}>
          Set Edge Prop
        </button>
        <button onClick={onStartSetAllNodeProp}>
          Set All Node Prop
        </button>
        <button onClick={onStartSetAllEdgeProp}>
          Set All Edge Prop
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