import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const DuplicateCode = () => {
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

  const duplicates = report.duplicates;

  if (!duplicates) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">Duplicate Code</h1>
        <p className="text-sm opacity-60">No duplicate code scan data available for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Duplicate Code</h1>
        <p className="text-sm opacity-60">
          {duplicates.duplicate_block_count} duplicated block{duplicates.duplicate_block_count !== 1 ? "s" : ""} found across files
        </p>
      </div>

      {duplicates.duplicates.length === 0 ? (
        <div className="bg-base-200 rounded-box shadow-clay p-6">
          <p className="text-sm opacity-70">No significant duplicate code detected — good sign for maintainability.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {duplicates.duplicates.map((block, i) => (
            <div key={i} className="bg-base-200 rounded-box shadow-clay-sm p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-secondary badge-sm">{block.lines_duplicated} lines</span>
                <span className="font-display font-semibold text-sm">
                  Duplicated in {block.occurrences.length} locations
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {block.occurrences.map((occ, j) => (
                  <div key={j} className="font-mono text-xs bg-base-300 rounded-lg px-3 py-2 shadow-clay-pressed">
                    {occ.file_path}
                    <span className="opacity-50"> — lines {occ.start_line}–{occ.end_line}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DuplicateCode;