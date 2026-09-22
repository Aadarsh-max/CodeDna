import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import CytoscapeComponent from "react-cytoscapejs";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const methodBadgeClass = (method) => {
  if (method === "GET") return "badge-info";
  if (method === "POST") return "badge-success";
  if (method === "PUT" || method === "PATCH") return "badge-warning";
  if (method === "DELETE") return "badge-error";
  return "badge-neutral";
};

const stylesheet = [
  {
    selector: "node",
    style: {
      "background-color": "#F1EFE8",
      "border-width": 2,
      "border-color": "#0E8C7E",
      shape: "round-rectangle",
      width: 140,
      height: 50,
      label: "data(label)",
      "text-wrap": "wrap",
      "text-valign": "center",
      "text-halign": "center",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 10,
      "font-weight": 600,
      color: "#1B221E",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1.5,
      "line-color": "#6D5FC4",
      "target-arrow-color": "#6D5FC4",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      opacity: 0.6,
    },
  },
];

const ApiExplorer = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  useEffect(() => {
    setCurrentAnalysisId(analysisId);
  }, [analysisId, setCurrentAnalysisId]);

  useEffect(() => {
    reportApi
      .getReport(analysisId)
      .then(setReport)
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [analysisId]);

  const apiGraph = report?.apiGraph;

  const filteredRoutes = useMemo(() => {
    const all = apiGraph?.all_routes || [];
    if (methodFilter === "All") return all;
    return all.filter((r) => r.method === methodFilter);
  }, [apiGraph, methodFilter]);

  const elements = useMemo(() => {
    if (!apiGraph?.nodes?.length) return [];
    const nodes = apiGraph.nodes.map((n) => ({
      data: { id: n.id, label: `${n.id}\n${n.route_count} route${n.route_count !== 1 ? "s" : ""}` },
    }));
    const edges = apiGraph.edges.map((e, i) => ({
      data: { id: `e-${i}`, source: e.source, target: e.target },
    }));
    return [...nodes, ...edges];
  }, [apiGraph]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !report) {
    return <p className="text-error">{error || "Report not found"}</p>;
  }

  if (!apiGraph) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">API Explorer</h1>
        <p className="text-sm opacity-60">No API graph data available for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">API Explorer</h1>
        <p className="text-sm opacity-60">
          {apiGraph.total_routes} route{apiGraph.total_routes !== 1 ? "s" : ""} detected across {apiGraph.route_file_count} file{apiGraph.route_file_count !== 1 ? "s" : ""}
        </p>
      </div>

      {apiGraph.total_routes === 0 ? (
        <div className="bg-base-200 rounded-box shadow-clay p-6">
          <p className="text-sm opacity-70">No API routes detected — this may not be a web server project, or it uses a framework outside the detected Express/FastAPI/Flask patterns.</p>
        </div>
      ) : (
        <>
          {elements.length > 0 && (
            <div className="h-[45vh] bg-base-200 rounded-box shadow-clay overflow-hidden">
              <CytoscapeComponent
                elements={elements}
                stylesheet={stylesheet}
                layout={{ name: "cose", animate: false, padding: 40 }}
                style={{ width: "100%", height: "100%" }}
                minZoom={0.3}
                maxZoom={2}
              />
            </div>
          )}

          <div role="tablist" className="tabs tabs-boxed w-fit">
            {["All", "GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => (
              <button
                key={method}
                role="tab"
                onClick={() => setMethodFilter(method)}
                className={`tab ${methodFilter === method ? "tab-active" : ""}`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {filteredRoutes.map((route, i) => (
              <div key={i} className="bg-base-200 rounded-box shadow-clay-sm p-4 flex items-center gap-4 flex-wrap">
                <span className={`badge ${methodBadgeClass(route.method)} badge-sm w-16 justify-center`}>{route.method}</span>
                <span className="font-mono text-sm">{route.path}</span>
                <span className="font-mono text-xs opacity-50 ml-auto">{route.file_path}:{route.line}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ApiExplorer;