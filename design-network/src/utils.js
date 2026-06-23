export const getSvgCoordinates = (svg, e) => {
  const rect = svg.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

export const nodeHasEdges = (nodeId, edges) => {
  return edges.some((e) => e.source === nodeId || e.target === nodeId);
};

export const getEdgeEndpoints = (sourceNode, targetNode) => {
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

export const formatProperties = (props) => {
  const entries = Object.entries(props);
  if (entries.length === 0) return 'No properties';
  return entries.map(([k, v]) => `${k}: ${v}`).join('\n');
};