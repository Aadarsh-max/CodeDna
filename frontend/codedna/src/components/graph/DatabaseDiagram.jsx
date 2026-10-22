import { useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const MAX_FIELDS_SHOWN = 10;

const buildElements = (entities, relationships) => {
  const nodes = entities.map((entity) => {
    const shown = entity.fields.slice(0, MAX_FIELDS_SHOWN).join(", ");
    const extra = entity.fields.length > MAX_FIELDS_SHOWN ? `, +${entity.fields.length - MAX_FIELDS_SHOWN} more` : "";
    return {
      data: { id: entity.name, label: `${entity.name}\n\n${shown}${extra}` },
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
      width: "label",
      height: "label",
      padding: "16px",
      label: "data(label)",
      "text-wrap": "wrap",
      "text-max-width": 220,
      "text-valign": "center",
      "text-halign": "center",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 12,
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
      "font-size": 11,
      color: "#0E8C7E",
      "text-background-color": "#E9E6DC",
      "text-background-opacity": 1,
      "text-background-padding": 3,
    },
  },
];

const DatabaseDiagram = ({ entities, relationships }) => {
  const elements = useMemo(() => {
    if (!entities?.length) return [];
    return buildElements(entities, relationships);
  }, [entities, relationships]);

  if (elements.length === 0) {
    return <p className="opacity-60">No database entities detected.</p>;
  }

  return (
    <div className="h-[65vh] bg-base-200 rounded-box shadow-clay overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={{ name: "breadthfirst", directed: true, spacingFactor: 1.8, padding: 50 }}
        style={{ width: "100%", height: "100%" }}
        minZoom={0.3}
        maxZoom={2}
      />
    </div>
  );
};

export default DatabaseDiagram;