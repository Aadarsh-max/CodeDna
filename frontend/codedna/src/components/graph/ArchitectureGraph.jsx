import { useMemo } from "react";
import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import "reactflow/dist/style.css";

const ANGLE_STEP = 0.6;
const RADIUS = 220;
const Y_SPACING = 70;
const MAX_NODES = 150;

const HelixNode = ({ data }) => {
  const colorClass =
    data.risk === "High" ? "bg-error" : data.risk === "Medium" ? "bg-warning" : "bg-primary";

  return (
    <motion.div
      title={`${data.label} — ${data.risk} risk (${Math.round(data.bugProbability * 100)}%)`}
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

  const limited = graphNodes.slice(0, MAX_NODES);

  return limited.map((node, i) => {
    const angle = i * ANGLE_STEP;
    const x = 300 + RADIUS * Math.sin(angle);
    const y = i * Y_SPACING;
    const depth = (Math.cos(angle) + 1) / 2;
    const risk = riskByFile[node.id]?.risk_level || "Low";
    const bugProbability = riskByFile[node.id]?.bug_probability ?? 0;

    return {
      id: node.id,
      type: "helix",
      position: { x, y },
      data: {
        label: node.id,
        risk,
        bugProbability,
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
  const { nodes, edges } = useMemo(() => {
    if (!graph?.nodes?.length) return { nodes: [], edges: [] };
    const builtNodes = buildLayout(graph.nodes, predictions);
    const includedIds = new Set(builtNodes.map((n) => n.id));
    const builtEdges = buildEdges(graph.edges || [], includedIds);
    return { nodes: builtNodes, edges: builtEdges };
  }, [graph, predictions]);

  if (nodes.length === 0) {
    return <p className="text-sm opacity-60">No graph data available.</p>;
  }

  return (
    <div className="h-[70vh] bg-base-200 border border-base-300 rounded-box overflow-hidden">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }} nodesConnectable={false} elementsSelectable={false}>
        <Background color="#1A1F2B" gap={24} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default ArchitectureGraph;