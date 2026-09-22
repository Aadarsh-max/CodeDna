import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const severityBadgeClass = (severity) => {
  if (severity === "High") return "badge-error";
  if (severity === "Medium") return "badge-warning";
  return "badge-info";
};

const SecurityIssues = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

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

  const issues = useMemo(() => {
    const all = report?.security?.issues || [];
    if (filter === "All") return all;
    return all.filter((i) => i.severity === filter);
  }, [report, filter]);

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

  const security = report.security;

  if (!security) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">Security & Vulnerability Scan</h1>
        <p className="text-sm opacity-60">No security scan data available for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Security & Vulnerability Scan</h1>
        <p className="text-sm opacity-60">
          {security.total_issues} issue{security.total_issues !== 1 ? "s" : ""} found — pattern-based static analysis, not a full SAST audit
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-base-200 rounded-box shadow-clay p-6 flex flex-col items-center gap-1">
          <span className="text-3xl font-display font-semibold">{security.total_issues}</span>
          <span className="text-sm opacity-60">Total Issues</span>
        </div>
        <div className="bg-base-200 rounded-box shadow-clay p-6 flex flex-col items-center gap-1">
          <span className="text-3xl font-display font-semibold text-error">{security.high_severity_count}</span>
          <span className="text-sm opacity-60">High Severity</span>
        </div>
        <div className="bg-base-200 rounded-box shadow-clay p-6 flex flex-col items-center gap-1">
          <span className="text-3xl font-display font-semibold text-warning">{security.medium_severity_count}</span>
          <span className="text-sm opacity-60">Medium Severity</span>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-boxed w-fit">
        {["All", "High", "Medium"].map((level) => (
          <button
            key={level}
            role="tab"
            onClick={() => setFilter(level)}
            className={`tab ${filter === level ? "tab-active" : ""}`}
          >
            {level}
          </button>
        ))}
      </div>

      {issues.length === 0 ? (
        <div className="bg-base-200 rounded-box shadow-clay p-6">
          <p className="text-sm opacity-70">No issues found for this filter — nice and clean.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {issues.map((issue, i) => (
            <div key={i} className="bg-base-200 rounded-box shadow-clay-sm p-5 flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`badge ${severityBadgeClass(issue.severity)} badge-sm`}>{issue.severity}</span>
                <span className="font-display font-semibold text-sm">{issue.title}</span>
                <span className="font-mono text-xs opacity-50">{issue.file_path}:{issue.line}</span>
              </div>
              <p className="text-sm opacity-70">{issue.description}</p>
              <code className="font-mono text-xs bg-base-300 rounded-lg px-3 py-2 overflow-x-auto shadow-clay-pressed">
                {issue.snippet}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecurityIssues;