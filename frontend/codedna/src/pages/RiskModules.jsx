import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";
const RISK_ORDER = { High: 0, Medium: 1, Low: 2 };

const riskBadgeClass = (risk) => {
  if (risk === "High") return "badge-error";
  if (risk === "Medium") return "badge-warning";
  return "badge-primary";
};

const RiskModules = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();

  useEffect(() => {
    setCurrentAnalysisId(analysisId);
  }, [analysisId, setCurrentAnalysisId]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("risk");

  useEffect(() => {
    reportApi
      .getReport(analysisId)
      .then(setReport)
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [analysisId]);

  const files = useMemo(() => {
    if (!report) return [];

    const explanationByPath = {};
    (report.explanations || []).forEach((e) => {
      explanationByPath[e.file_path] = e;
    });

    let merged = (report.riskModules?.predictions || []).map((p) => ({
      ...p,
      top_reasons: explanationByPath[p.file_path]?.top_reasons || [],
      feature_contributions:
        explanationByPath[p.file_path]?.feature_contributions || {},
    }));

    if (filter !== "All") {
      merged = merged.filter((f) => f.risk_level === filter);
    }

    merged.sort((a, b) => {
      if (sortBy === "risk")
        return RISK_ORDER[a.risk_level] - RISK_ORDER[b.risk_level];
      if (sortBy === "probability")
        return b.bug_probability - a.bug_probability;
      if (sortBy === "debt")
        return b.technical_debt_score - a.technical_debt_score;
      return 0;
    });

    return merged;
  }, [report, filter, sortBy]);

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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">Risk Modules</h1>
        <p className="text-sm opacity-60">{files.length} files shown</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div role="tablist" className="tabs tabs-boxed w-fit">
          {["All", "High", "Medium", "Low"].map((level) => (
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

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="select select-bordered select-sm w-fit"
        >
          <option value="risk">Sort by risk level</option>
          <option value="probability">Sort by bug probability</option>
          <option value="debt">Sort by technical debt</option>
        </select>
      </div>

      <div className="hidden md:grid grid-cols-[1fr_100px_120px_140px] gap-4 px-4 text-xs opacity-50 font-medium">
        <span>File</span>
        <span>Risk</span>
        <span>Bug Probability</span>
        <span>Technical Debt</span>
      </div>

      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <div
            key={file.file_path}
            className="collapse collapse-arrow bg-base-200 border border-base-300 rounded-box"
          >
            <input type="checkbox" />
            <div className="collapse-title grid grid-cols-2 md:grid-cols-[1fr_100px_120px_140px] gap-4 items-center pr-10">
              <span className="font-mono text-sm truncate">
                {file.file_path}
              </span>
              <span
                className={`badge ${riskBadgeClass(file.risk_level)} badge-sm w-fit`}
              >
                {file.risk_level}
              </span>
              <span className="text-sm">
                {Math.round(file.bug_probability * 100)}%
              </span>
              <span className="text-sm">
                {file.technical_debt_score.toFixed(1)}
              </span>
            </div>
            <div className="collapse-content flex flex-col gap-4">
              {file.top_reasons.length > 0 ? (
                <ul className="flex flex-col gap-1 text-sm">
                  {file.top_reasons.map((reason, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-warning">▲</span>
                      <span className="opacity-80">{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm opacity-60">
                  No significant risk factors identified.
                </p>
              )}

              {Object.keys(file.feature_contributions).length > 0 && (
                <div className="flex flex-col gap-2 pt-3 border-t border-base-300">
                  <span className="text-xs opacity-50 font-medium">
                    Feature contribution to risk
                  </span>
                  {Object.entries(file.feature_contributions).map(
                    ([feature, value]) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 text-xs"
                      >
                        <span className="w-32 opacity-70 font-mono">
                          {feature}
                        </span>
                        <div className="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden">
                          <div
                            className={
                              value >= 0
                                ? "h-full bg-error"
                                : "h-full bg-primary"
                            }
                            style={{
                              width: `${Math.min(Math.abs(value) * 400, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="w-12 text-right opacity-60">
                          {value.toFixed(3)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {files.length === 0 && (
          <p className="text-sm opacity-60">No files match this filter.</p>
        )}
      </div>
    </div>
  );
};

export default RiskModules;
