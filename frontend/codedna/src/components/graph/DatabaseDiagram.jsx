import { useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const buildElements = (entities, relationships) => {
  const nodes = entities.map((entity) => {
    const displayFields = entity.fields.slice(0, 8);
    const extra = entity.fields.length > 8 ? `\n+${entity.fields.length - 8} more` : "";
    return {
      data: { id: entity.name, label: `${entity.name}\n${displayFields.join(", ")}${extra}` },
    };
  });

  const edges = relationships.map((rel, i) => ({
    data: { id: `e-${i}`, source: rel.source, target: rel.target, label: rel.field },
  }));

  return [...nodes, ...edges];
};

const stylesheet = [
  {
    selector: "node",
    style: {
      "background-color": "#F1EFE8",
      "border-width": 2,
      "border-color": "#6D5FC4",
      shape: "round-rectangle",
      width: 190,
      height: 90,
      label: "data(label)",
      "text-wrap": "wrap",
      "text-valign": "center",
      "text-halign": "center",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 9,
      color: "#1B221E",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1.5,
      "line-color": "#0E8C7E",
      "target-arrow-color": "#0E8C7E",
      "target-arrow-shape": "triangle",
      "curve-style": "taxi",
      "taxi-direction": "downward",
      "taxi-turn": "50%",
      label: "data(label)",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 9,
      color: "#0E8C7E",
      "text-background-color": "#F1EFE8",
      "text-background-opacity": 1,
      "text-background-padding": 2,
    },
  },
];

const DatabaseDiagram = ({ entities, relationships }) => {
  const elements = useMemo(() => {
    if (!entities?.length) return [];
    return buildElements(entities, relationships);
  }, [entities, relationships]);

  if (elements.length === 0) {
    return <p className="text-sm opacity-60">No database entities detected.</p>;
  }

  return (
    <div className="h-[60vh] bg-base-200 rounded-box shadow-clay overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={{ name: "breadthfirst", directed: true, spacingFactor: 1.6, padding: 50 }}
        style={{ width: "100%", height: "100%" }}
        minZoom={0.3}
        maxZoom={2}
      />
    </div>
  );
};

export default DatabaseDiagram;