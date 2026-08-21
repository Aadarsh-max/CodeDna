import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Network, ShieldAlert, Wrench, ArrowRight } from "lucide-react";
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
    return (
      <p className="text-error text-sm bg-error/10 border border-error/20 rounded-field px-4 py-3 inline-block">
        {error || "Report not found"}
      </p>
    );
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
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-content">
          {repository?.name}
        </h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-xs sm:text-sm text-base-content/55 mt-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-base-200 shadow-clay-pressed text-[11px] sm:text-xs font-medium">
            {repository?.source}
          </span>
          {repository?.language && <span>{repository.language}</span>}
          <span>{totalFiles} files analyzed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 auto-rows-[minmax(150px,auto)]">
        <div className="sm:col-span-2 md:col-span-2 md:row-span-2 bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-base-content">AI Summary</h2>
          <p className="text-sm text-base-content/75 leading-relaxed">{documentation?.summary}</p>
          {documentation?.insights?.length > 0 && (
            <ul className="text-sm flex flex-col gap-2 mt-1">
              {documentation.insights.map((insight, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-base-content/75">{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6 flex flex-col items-center justify-center gap-3">
          <div className="rounded-full shadow-clay-pressed p-2 bg-base-200">
            <div
              className={`radial-progress ${scoreColor(maintainability)}`}
              style={{ "--value": maintainability, "--size": "4.5rem", "--thickness": "5px" }}
              role="progressbar"
            >
              <span className="text-sm font-semibold">{maintainability}</span>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-base-content/55 text-center">Maintainability</span>
        </div>

        <div className="bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6 flex flex-col items-center justify-center gap-3">
          <div className="rounded-full shadow-clay-pressed p-2 bg-base-200">
            <div
              className={`radial-progress ${scoreColor(bugProbability, true)}`}
              style={{ "--value": bugProbability, "--size": "4.5rem", "--thickness": "5px" }}
              role="progressbar"
            >
              <span className="text-sm font-semibold">{bugProbability}%</span>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-base-content/55 text-center">Avg Bug Risk</span>
        </div>

        <div className="bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl sm:text-4xl font-display font-semibold text-error">
            {highRiskCount}
          </span>
          <span className="text-xs sm:text-sm text-base-content/55 text-center">High Risk Files</span>
        </div>

        <Link
          to={`/architecture/${analysisId}`}
          className="group bg-linear-to-br from-base-100 to-base-200 shadow-clay-sm hover:shadow-clay rounded-[1.5rem] p-5 sm:p-6 flex flex-col justify-between gap-6 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-base-content">Architecture</span>
            <Network size={17} className="text-primary/60" strokeWidth={2} />
          </div>
          <span className="text-sm text-base-content/55 flex items-center gap-1.5 group-hover:text-primary transition-colors duration-200">
            View dependency graph <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </Link>

        <Link
          to={`/risks/${analysisId}`}
          className="group bg-linear-to-br from-base-100 to-base-200 shadow-clay-sm hover:shadow-clay rounded-[1.5rem] p-5 sm:p-6 flex flex-col justify-between gap-6 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-base-content">Risk Modules</span>
            <ShieldAlert size={17} className="text-primary/60" strokeWidth={2} />
          </div>
          <span className="text-sm text-base-content/55 flex items-center gap-1.5 group-hover:text-primary transition-colors duration-200">
            {highRiskCount} files flagged <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </Link>

        <Link
          to={`/refactor/${analysisId}`}
          className="group bg-linear-to-br from-base-100 to-base-200 shadow-clay-sm hover:shadow-clay rounded-[1.5rem] p-5 sm:p-6 flex flex-col justify-between gap-6 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-base-content">Refactor Plan</span>
            <Wrench size={17} className="text-primary/60" strokeWidth={2} />
          </div>
          <span className="text-sm text-base-content/55 flex items-center gap-1.5 group-hover:text-primary transition-colors duration-200">
            {refactorStepCount} suggested steps <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;