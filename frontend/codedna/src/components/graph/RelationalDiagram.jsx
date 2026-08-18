import { useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const riskColor = {
  High: "#F0554B",
  Medium: "#F2B84B",
  Low: "#5EEAD4",
};

const getGroup = (filePath) => {
  const parts = filePath.split("/");
  return parts.length > 1 ? parts[0] : "root files";
};

const buildRelationalElements = (graph, predictions) => {
  const riskByFile = {};
  predictions?.forEach((p) => {
    riskByFile[p.file_path] = p.risk_level;
  });

  const groups = {};

  graph.nodes.forEach((node) => {
    const group = getGroup(node.id);
    if (!groups[group]) {
      groups[group] = { fileCount: 0, highRisk: 0, mediumRisk: 0 };
    }
    groups[group].fileCount += 1;
    const risk = riskByFile[node.id] || "Low";
    if (risk === "High") groups[group].highRisk += 1;
    else if (risk === "Medium") groups[group].mediumRisk += 1;
  });

  const nodes = Object.entries(groups).map(([group, stats]) => {
    const dominantRisk = stats.highRisk > 0 ? "High" : stats.mediumRisk > 0 ? "Medium" : "Low";
    return {
      data: {
        id: group,
        label: `${group}\n${stats.fileCount} files`,
        risk: dominantRisk,
      },
    };
  });

  const edgeCounts = {};
  graph.edges.forEach((e) => {
    const sourceGroup = getGroup(e.source);
    const targetGroup = getGroup(e.target);
    if (sourceGroup === targetGroup) return;
    const key = `${sourceGroup}->${targetGroup}`;
    edgeCounts[key] = (edgeCounts[key] || 0) + 1;
  });

  const edges = Object.entries(edgeCounts).map(([key, count], i) => {
    const [source, target] = key.split("->");
    return { data: { id: `e-${i}`, source, target, label: `${count} imports` } };
  });

  return [...nodes, ...edges];
};

const stylesheet = [
  {
    selector: "node",
    style: {
      "background-color": "#12161F",
      "border-width": 2,
      "border-color": (ele) => riskColor[ele.data("risk")] || riskColor.Low,
      shape: "round-rectangle",
      width: 130,
      height: 56,
      label: "data(label)",
      "text-wrap": "wrap",
      "text-valign": "center",
      "text-halign": "center",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 11,
      "font-weight": 600,
      color: "#E8EAED",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1.5,
      "line-color": "#8B7FD6",
      "target-arrow-color": "#8B7FD6",
      "target-arrow-shape": "triangle",
      "arrow-scale": 1,
      "curve-style": "taxi",
      "taxi-direction": "downward",
      "taxi-turn": "50%",
      label: "data(label)",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 9,
      color: "#8B7FD6",
      "text-background-color": "#0B0E14",
      "text-background-opacity": 1,
      "text-background-padding": 2,
    },
  },
];

const RelationalDiagram = ({ graph, predictions }) => {
  const elements = useMemo(() => {
    if (!graph?.nodes?.length) return [];
    return buildRelationalElements(graph, predictions);
  }, [graph, predictions]);

  if (elements.length === 0) {
    return <p className="text-sm opacity-60">No graph data available.</p>;
  }

  return (
    <div className="h-[60vh] bg-base-200 border border-base-300 rounded-box overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={{ name: "breadthfirst", directed: true, spacingFactor: 1.4, padding: 50 }}
        style={{ width: "100%", height: "100%" }}
        minZoom={0.4}
        maxZoom={2}
      />
    </div>
  );
};

export default RelationalDiagram;