import React, { useRef, useEffect } from 'react';

const LogPanel = ({ logs }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="log-container" ref={containerRef}>
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
  );
};

export default LogPanel;