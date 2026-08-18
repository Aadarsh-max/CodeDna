import { useMemo, useState, useCallback } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const riskColor = {
  High: "#F0554B",
  Medium: "#F2B84B",
  Low: "#5EEAD4",
};

const MAX_NODES = 150;

const buildElements = (graph, predictions) => {
  const riskByFile = {};
  predictions?.forEach((p) => {
    riskByFile[p.file_path] = p;
  });

  const limitedNodes = graph.nodes.slice(0, MAX_NODES);
  const nodeIds = new Set(limitedNodes.map((n) => n.id));

  const nodes = limitedNodes.map((node) => {
    const prediction = riskByFile[node.id];
    const risk = prediction?.risk_level || "Low";
    return {
      data: {
        id: node.id,
        risk,
        bugProbability: prediction?.bug_probability ?? 0,
        size: 16 + Math.min(node.complexity_score || 0, 30),
      },
    };
  });

  const edges = graph.edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e, i) => ({
      data: { id: `e-${i}`, source: e.source, target: e.target },
    }));

  return [...nodes, ...edges];
};

const stylesheet = [
  {
    selector: "node",
    style: {
      "background-color": (ele) => riskColor[ele.data("risk")] || riskColor.Low,
      width: "data(size)",
      height: "data(size)",
      "border-width": 0,
    },
  },
  {
    selector: "edge",
    style: {
      width: 1,
      "line-color": "#8B7FD6",
      "line-opacity": 0.3,
      "curve-style": "bezier",
      "target-arrow-shape": "none",
    },
  },
];

const DependencyGraph = ({ graph, predictions }) => {
  const [hovered, setHovered] = useState(null);

  const elements = useMemo(() => {
    if (!graph?.nodes?.length) return [];
    return buildElements(graph, predictions);
  }, [graph, predictions]);

  const registerEvents = useCallback((cy) => {
    cy.on("mouseover", "node", (e) => setHovered(e.target.data()));
    cy.on("mouseout", "node", () => setHovered(null));
  }, []);

  if (elements.length === 0) {
    return <p className="text-sm opacity-60">No graph data available.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="h-9 flex items-center px-1">
        {hovered ? (
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="opacity-90">{hovered.id}</span>
            <span className="opacity-50">·</span>
            <span className="opacity-70">{hovered.risk} risk</span>
            <span className="opacity-70">{Math.round(hovered.bugProbability * 100)}% bug probability</span>
          </div>
        ) : (
          <span className="text-xs opacity-40">Hover a node to see file details</span>
        )}
      </div>

      <div className="h-[68vh] bg-base-200 border border-base-300 rounded-box overflow-hidden">
        <CytoscapeComponent
          elements={elements}
          stylesheet={stylesheet}
          layout={{ name: "cose", animate: false, padding: 40 }}
          style={{ width: "100%", height: "100%" }}
          minZoom={0.2}
          maxZoom={3}
          cy={registerEvents}
        />
      </div>
    </div>
  );
};

export default DependencyGraph;