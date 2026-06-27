import React from 'react';
import { getEdgeEndpoints, formatProperties } from '../utils';

const Canvas = ({
  svgRef,
  nodes,
  edges,
  mode,
  edgeSource,
  draggingNodeId,
  onSvgClick,
  onNodeClick,
  onNodeMouseDown,
  onEdgeClick,
  propertyDefs,   // new prop: { nodeProps, edgeProps }
}) => {
  // Helper to build tooltip text for a node
  const getNodeTooltip = (node) => {
    const { nodeProps } = propertyDefs;
    const label = node.label || node.id;
    let text = `Node ${label}\n`;
    if (nodeProps.length === 0) {
      text += 'No properties defined.';
    } else {
      nodeProps.forEach(prop => {
        const value = node.properties[prop.name] !== undefined
          ? node.properties[prop.name]
          : `${prop.max} (default)`;
        text += `${prop.name}: ${value}\n`;
      });
    }
    return text.trim();
  };

  // Helper to build tooltip text for an edge
  const getEdgeTooltip = (edge) => {
    const { edgeProps } = propertyDefs;
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const sourceLabel = sourceNode ? (sourceNode.label || sourceNode.id) : edge.source;
    const targetLabel = targetNode ? (targetNode.label || targetNode.id) : edge.target;
    let text = `Edge ${sourceLabel} → ${targetLabel}\n`;
    if (edgeProps.length === 0) {
      text += 'No properties defined.';
    } else {
      edgeProps.forEach(prop => {
        const value = edge.properties[prop.name] !== undefined
          ? edge.properties[prop.name]
          : `${prop.max} (default)`;
        text += `${prop.name}: ${value}\n`;
      });
    }
    return text.trim();
  };

  const renderEdges = () => {
    return edges.map((edge, idx) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return null;

      const tooltipText = getEdgeTooltip(edge);

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
          <g key={`edge-${idx}`} onClick={onEdgeClick(idx)} style={{ cursor: mode === 'deleteEdge' || mode === 'addEdgeProp' ? 'pointer' : 'default' }}>
            <path d={d} stroke="transparent" strokeWidth="12" fill="none" />
            <path d={d} stroke="#666" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            <title>{tooltipText}</title>
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
          <g key={`edge-${idx}`} onClick={onEdgeClick(idx)} style={{ cursor: mode === 'deleteEdge' || mode === 'addEdgeProp' ? 'pointer' : 'default' }}>
            <path d={pathData} stroke="transparent" strokeWidth="12" fill="none" />
            <path d={pathData} stroke="#666" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            <title>{tooltipText}</title>
          </g>
        );
      } else {
        return (
          <g key={`edge-${idx}`} onClick={onEdgeClick(idx)} style={{ cursor: mode === 'deleteEdge' || mode === 'addEdgeProp' ? 'pointer' : 'default' }}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="12" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <title>{tooltipText}</title>
          </g>
        );
      }
    });
  };

  const renderNodes = () => {
    return nodes.map((node) => {
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
        cursor = draggingNodeId === node.id ? 'grabbing' : 'grab';
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
      const tooltipText = getNodeTooltip(node);

      return (
        <g
          key={node.id}
          onClick={onNodeClick(node.id)}
          onMouseDown={onNodeMouseDown(node.id)}
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
          <title>{tooltipText}</title>
        </g>
      );
    });
  };

  return (
    <svg ref={svgRef} className="canvas" onClick={onSvgClick}>
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
      {renderEdges()}
      {renderNodes()}
    </svg>
  );
};

export default Canvas;