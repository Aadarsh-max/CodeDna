import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const DeadCode = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    return <p className="text-error">{error || "Report not found"}</p>;
  }

  const deadCode = report.deadCode;

  if (!deadCode) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">Dead Code</h1>
        <p className="text-sm opacity-60">No dead code scan data available for this analysis.</p>
      </div>
    );
  }

  const grouped = deadCode.possibly_unused_exports.reduce((acc, item) => {
    if (!acc[item.file_path]) acc[item.file_path] = [];
    acc[item.file_path].push(item.export_name);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dead Code</h1>
        <p className="text-sm opacity-60">
          {deadCode.possibly_unused_count} export{deadCode.possibly_unused_count !== 1 ? "s" : ""} appear unused elsewhere in the codebase — heuristic, verify before removing
        </p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-base-200 rounded-box shadow-clay p-6">
          <p className="text-sm opacity-70">No unused exports detected.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(grouped).map(([filePath, names]) => (
            <div key={filePath} className="bg-base-200 rounded-box shadow-clay-sm p-5 flex flex-col gap-3">
              <span className="font-mono text-sm opacity-80">{filePath}</span>
              <div className="flex flex-wrap gap-2">
                {names.map((name) => (
                  <span key={name} className="font-mono text-xs bg-base-300 rounded-lg px-2.5 py-1 shadow-clay-pressed">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeadCode;