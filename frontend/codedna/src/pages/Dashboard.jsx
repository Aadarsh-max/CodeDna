import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const scoreColor = (value, invert = false) => {
  const effective = invert ? 100 - value : value;
  if (effective >= 70) return "text-primary";
  if (effective >= 40) return "text-warning";
  return "text-error";
};

const Dashboard = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();

  useEffect(() => {
    setCurrentAnalysisId(analysisId);
  }, [analysisId, setCurrentAnalysisId]);
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

  const {
    repository,
    metrics,
    riskModules,
    maintainabilityScore,
    documentation,
    refactorPlanDraft,
  } = report;

  const maintainability = Math.round(
    maintainabilityScore?.average_maintainability ?? 0,
  );
  const bugProbability = Math.round(
    (riskModules?.average_bug_probability ?? 0) * 100,
  );
  const highRiskCount = riskModules?.high_risk_file_count ?? 0;
  const totalFiles = metrics?.length ?? 0;
  const refactorStepCount = refactorPlanDraft?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          {repository?.name}
        </h1>
        <div className="flex gap-2 items-center text-sm opacity-60 mt-1">
          <span className="badge badge-sm badge-neutral">
            {repository?.source}
          </span>
          {repository?.language && <span>{repository.language}</span>}
          <span>{totalFiles} files analyzed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(150px,auto)]">
        <div className="md:col-span-2 md:row-span-2 bg-base-200 border border-base-300 rounded-box p-6 flex flex-col gap-4">
          <h2 className="font-display font-semibold">AI Summary</h2>
          <p className="text-sm opacity-80">{documentation?.summary}</p>
          {documentation?.insights?.length > 0 && (
            <ul className="text-sm flex flex-col gap-2 mt-2">
              {documentation.insights.map((insight, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span className="opacity-80">{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-base-200 border border-base-300 rounded-box p-6 flex flex-col items-center justify-center gap-2">
          <div
            className={`radial-progress ${scoreColor(maintainability)}`}
            style={{ "--value": maintainability, "--size": "5rem" }}
            role="progressbar"
          >
            {maintainability}
          </div>
          <span className="text-sm opacity-60">Maintainability</span>
        </div>

        <div className="bg-base-200 border border-base-300 rounded-box p-6 flex flex-col items-center justify-center gap-2">
          <div
            className={`radial-progress ${scoreColor(bugProbability, true)}`}
            style={{ "--value": bugProbability, "--size": "5rem" }}
            role="progressbar"
          >
            {bugProbability}%
          </div>
          <span className="text-sm opacity-60">Avg Bug Risk</span>
        </div>

        <div className="bg-base-200 border border-base-300 rounded-box p-6 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl font-display font-semibold text-error">
            {highRiskCount}
          </span>
          <span className="text-sm opacity-60">High Risk Files</span>
        </div>

        <Link
          to={`/architecture/${analysisId}`}
          className="bg-base-200 border border-base-300 rounded-box p-6 flex flex-col justify-between hover:border-primary transition-colors"
        >
          <span className="font-display font-semibold">Architecture</span>
          <span className="text-sm opacity-60">View dependency graph →</span>
        </Link>

        <Link
          to={`/risks/${analysisId}`}
          className="bg-base-200 border border-base-300 rounded-box p-6 flex flex-col justify-between hover:border-primary transition-colors"
        >
          <span className="font-display font-semibold">Risk Modules</span>
          <span className="text-sm opacity-60">
            {highRiskCount} files flagged →
          </span>
        </Link>

        <Link
          to={`/refactor/${analysisId}`}
          className="bg-base-200 border border-base-300 rounded-box p-6 flex flex-col justify-between hover:border-primary transition-colors"
        >
          <span className="font-display font-semibold">Refactor Plan</span>
          <span className="text-sm opacity-60">
            {refactorStepCount} suggested steps →
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
