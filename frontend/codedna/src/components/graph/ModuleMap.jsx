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

const buildModuleElements = (graph, predictions) => {
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
        size: 55 + Math.min(stats.fileCount, 40) * 3,
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
    return { data: { id: `e-${i}`, source, target, weight: count } };
  });

  return [...nodes, ...edges];
};

const stylesheet = [
  {
    selector: "node",
    style: {
      "background-color": (ele) => riskColor[ele.data("risk")] || riskColor.Low,
      width: "data(size)",
      height: "data(size)",
      label: "data(label)",
      "text-wrap": "wrap",
      "text-valign": "center",
      "text-halign": "center",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 12,
      "font-weight": 600,
      color: "#0B0E14",
    },
  },
  {
    selector: "edge",
    style: {
      width: (ele) => Math.min(1 + ele.data("weight") / 3, 8),
      "line-color": "#8B7FD6",
      "line-opacity": 0.5,
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#8B7FD6",
      "arrow-scale": 1.2,
    },
  },
];

const ModuleMap = ({ graph, predictions }) => {
  const elements = useMemo(() => {
    if (!graph?.nodes?.length) return [];
    return buildModuleElements(graph, predictions);
  }, [graph, predictions]);

  if (elements.length === 0) {
    return <p className="text-sm opacity-60">No graph data available.</p>;
  }

  return (
    <div className="h-[60vh] bg-base-200 border border-base-300 rounded-box overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={{ name: "cose", animate: false, padding: 60 }}
        style={{ width: "100%", height: "100%" }}
        minZoom={0.4}
        maxZoom={2}
      />
    </div>
  );
};

export default ModuleMap;