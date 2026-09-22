import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const cohesionColor = (score) => {
  if (score >= 60) return "text-primary";
  if (score >= 25) return "text-warning";
  return "text-error";
};

const Cohesion = () => {
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

  const cohesion = report.cohesion;

  if (!cohesion) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">Cohesion Analysis</h1>
        <p className="text-sm opacity-60">No cohesion data available for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Cohesion Analysis</h1>
        <p className="text-sm opacity-60">
          {cohesion.analyzed_file_count} files analyzed, {cohesion.skipped_file_count} skipped — JavaScript/TypeScript only
        </p>
      </div>

      <div className="bg-base-200 rounded-box shadow-clay p-5">
        <p className="text-sm opacity-70">
          A low score means a file's functions rarely share internal state — common and expected in utility/helper files, but worth a look in files meant to represent one focused responsibility (a single service or controller). This is a heuristic based on shared variable usage, not a definitive design flaw.
        </p>
      </div>

      {cohesion.files.length === 0 ? (
        <div className="bg-base-200 rounded-box shadow-clay p-6">
          <p className="text-sm opacity-70">No files had enough functions and shared state to meaningfully assess.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {cohesion.files.map((file) => (
            <div key={file.file_path} className="bg-base-200 rounded-box shadow-clay-sm p-4 flex items-center gap-4 flex-wrap">
              <span className={`font-display font-semibold text-lg w-14 ${cohesionColor(file.cohesion_score)}`}>
                {file.cohesion_score}
              </span>
              <span className="font-mono text-sm flex-1">{file.file_path}</span>
              <span className="text-xs opacity-50">{file.function_count} functions · {file.shared_state_vars} shared vars</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cohesion;