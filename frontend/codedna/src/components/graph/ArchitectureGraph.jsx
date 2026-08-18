import { useMemo, useState, useCallback } from "react";
import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import "reactflow/dist/style.css";

const ANGLE_STEP = 0.6;
const RADIUS = 220;
const Y_SPACING = 70;
const MAX_NODES = 150;
const INITIAL_FOCUS_COUNT = 18;

const HelixNode = ({ data }) => {
  const colorClass =
    data.risk === "High" ? "bg-error" : data.risk === "Medium" ? "bg-warning" : "bg-primary";

  return (
    <motion.div
      className={`rounded-full ${colorClass}`}
      style={{ width: data.size, height: data.size }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: data.depth }}
      transition={{ delay: Math.min(data.index, 40) * 0.012, duration: 0.3 }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </motion.div>
  );
};

const nodeTypes = { helix: HelixNode };

const buildLayout = (graphNodes, predictions) => {
  const riskByFile = {};
  predictions?.forEach((p) => {
    riskByFile[p.file_path] = p;
  });

  const sorted = [...graphNodes].sort(
    (a, b) => (b.complexity_score || 0) - (a.complexity_score || 0)
  );
  const limited = sorted.slice(0, MAX_NODES);

  return limited.map((node, i) => {
    const angle = i * ANGLE_STEP;
    const x = 300 + RADIUS * Math.sin(angle);
    const y = i * Y_SPACING;
    const depth = (Math.cos(angle) + 1) / 2;
    const prediction = riskByFile[node.id];
    const risk = prediction?.risk_level || "Low";
    const bugProbability = prediction?.bug_probability ?? 0;

    return {
      id: node.id,
      type: "helix",
      position: { x, y },
      data: {
        label: node.id,
        risk,
        bugProbability,
        complexity: node.complexity_score || 0,
        size: 14 + Math.min(node.complexity_score || 0, 30) / 2,
        depth: 0.4 + depth * 0.6,
        index: i,
      },
      draggable: false,
    };
  });
};

const buildEdges = (graphEdges, includedIds) => {
  return graphEdges
    .filter((e) => includedIds.has(e.source) && includedIds.has(e.target))
    .map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      style: { stroke: "#8B7FD6", strokeWidth: 1, opacity: 0.35 },
    }));
};

const ArchitectureGraph = ({ graph, predictions }) => {
  const [hovered, setHovered] = useState(null);

  const { nodes, edges, focusNodeIds } = useMemo(() => {
    if (!graph?.nodes?.length) return { nodes: [], edges: [], focusNodeIds: [] };
    const builtNodes = buildLayout(graph.nodes, predictions);
    const includedIds = new Set(builtNodes.map((n) => n.id));
    const builtEdges = buildEdges(graph.edges || [], includedIds);
    const focus = builtNodes.slice(0, INITIAL_FOCUS_COUNT).map((n) => ({ id: n.id }));
    return { nodes: builtNodes, edges: builtEdges, focusNodeIds: focus };
  }, [graph, predictions]);

  const handleNodeMouseEnter = useCallback((event, node) => {
    setHovered(node.data);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHovered(null);
  }, []);

  if (nodes.length === 0) {
    return <p className="text-sm opacity-60">No graph data available.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="h-9 flex items-center px-1">
        {hovered ? (
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="opacity-90">{hovered.label}</span>
            <span className="opacity-50">·</span>
            <span className="opacity-70">{hovered.risk} risk</span>
            <span className="opacity-70">{Math.round(hovered.bugProbability * 100)}% bug probability</span>
            <span className="opacity-70">complexity {hovered.complexity}</span>
          </div>
        ) : (
          <span className="text-xs opacity-40">
            Hover a node for details · sorted by complexity, most notable files first · scroll to explore the full strand
          </span>
        )}
      </div>

      <div className="h-[68vh] bg-base-200 border border-base-300 rounded-box overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ nodes: focusNodeIds, padding: 0.4, maxZoom: 1.2 }}
          minZoom={0.15}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          elementsSelectable={false}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
        >
          <Background color="#1A1F2B" gap={24} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ArchitectureGraph;