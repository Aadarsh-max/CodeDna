import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import ArchitectureGraph from "../components/graph/ArchitectureGraph.jsx";

const ArchitectureView = () => {
  const { analysisId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    return <p className="text-error">{error || "Report not found"}</p>;
  }

  const nodeCount = report.graph?.nodes?.length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">Architecture</h1>
        <p className="text-sm opacity-60">
          {nodeCount} files, {report.graph?.edges?.length ?? 0} dependency connections
          {nodeCount > 150 && " — showing first 150 for performance"}
        </p>
      </div>

      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Low risk</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning"></span> Medium risk</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-error"></span> High risk</span>
      </div>

      <ArchitectureGraph graph={report.graph} predictions={report.riskModules?.predictions} />
    </div>
  );
};

export default ArchitectureView;