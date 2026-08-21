import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";
import DependencyGraph from "../components/graph/DependencyGraph.jsx";
import RelationalDiagram from "../components/graph/RelationalDiagram.jsx";
import ArchitectureGraph from "../components/graph/ArchitectureGraph.jsx";

const CAPTIONS = {
  dependency: "Every file as its own circle. Connected files cluster together; independent files (like most tests) drift to the edges.",
  relational: "Each box is a folder in the project, sized by risk. Arrows show which parts of the codebase depend on which, labeled by how many files are involved — read top to bottom, like a circuit or ER diagram.",
  dna: "The same dependency data, arranged as a double helix.",
};

const TABS = [
  { key: "dependency", label: "Dependency Graph" },
  { key: "relational", label: "Relational Diagram" },
  { key: "dna", label: "DNA View" },
];

const ArchitectureView = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("relational");

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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <p className="text-error text-sm bg-error/10 border border-error/20 rounded-field px-4 py-3 inline-block">
        {error || "Report not found"}
      </p>
    );
  }

  const nodeCount = report.graph?.nodes?.length ?? 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-content">Architecture</h1>
          <p className="text-xs sm:text-sm text-base-content/55 mt-1">
            {nodeCount} files, {report.graph?.edges?.length ?? 0} dependency connections
            {nodeCount > 150 && view === "dependency" && " — showing first 150 for performance"}
          </p>
        </div>

        <div
          role="tablist"
          className="flex gap-1 p-1 rounded-field bg-base-200 shadow-clay-pressed w-full sm:w-fit overflow-x-auto"
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              onClick={() => setView(key)}
              className={`px-3 sm:px-4 py-1.5 rounded-field text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                view === key
                  ? "bg-base-100 shadow-clay-sm text-primary"
                  : "text-base-content/55 hover:text-base-content"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-base-content/60 max-w-2xl">{CAPTIONS[view]}</p>

      <div className="flex gap-4 flex-wrap text-xs text-base-content/65">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Low risk</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning"></span> Medium risk</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-error"></span> High risk</span>
      </div>

      {view === "dependency" && <DependencyGraph graph={report.graph} predictions={report.riskModules?.predictions} />}
      {view === "relational" && <RelationalDiagram graph={report.graph} predictions={report.riskModules?.predictions} />}
      {view === "dna" && <ArchitectureGraph graph={report.graph} predictions={report.riskModules?.predictions} />}
    </div>
  );
};

export default ArchitectureView;