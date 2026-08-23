import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";
import useAnalysis from "../hooks/useAnalysis.js";

const Refactoring = () => {
  const { analysisId } = useParams();
  const { setCurrentAnalysisId } = useAnalysis();

  useEffect(() => {
    setCurrentAnalysisId(analysisId);
  }, [analysisId, setCurrentAnalysisId]);
  const [report, setReport] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [updatingStepId, setUpdatingStepId] = useState(null);

  useEffect(() => {
    reportApi
      .getReport(analysisId)
      .then((data) => {
        setReport(data);
        setPlan(data.refactorPlan);
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [analysisId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const newPlan = await reportApi.createRefactorPlan(analysisId);
      setPlan(newPlan);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate refactor plan",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStep = async (stepId, currentStatus) => {
    const nextStatus = currentStatus === "applied" ? "pending" : "applied";
    setUpdatingStepId(stepId);

    try {
      const updatedPlan = await reportApi.updateStepStatus(
        plan._id,
        stepId,
        nextStatus,
      );
      setPlan(updatedPlan);
    } catch (err) {
      setError("Failed to update step");
    } finally {
      setUpdatingStepId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error && !report) {
    return (
      <p className="text-error text-sm bg-error/10 border border-error/20 rounded-field px-4 py-3 inline-block">
        {error}
      </p>
    );
  }

  const draft = report?.refactorPlanDraft || [];

  if (!plan && draft.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-content">Refactor Plan</h1>
        <p className="text-sm text-base-content/55">
          No refactoring actions were suggested — this codebase looks clean.
        </p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-content">Refactor Plan</h1>
          <p className="text-sm text-base-content/55">
            {draft.length} suggested actions found, ordered by the genetic
            algorithm.
          </p>
        </div>

        <div className="bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.5rem] p-5 sm:p-6 flex flex-col gap-4">
          <p className="text-sm text-base-content/75">
            Generate a tracked refactor plan to check off steps as you apply
            them.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-field bg-primary text-primary-content font-medium px-5 py-2.5 shadow-clay-sm hover:shadow-clay hover:-translate-y-0.5 active:translate-y-0 active:shadow-clay-pressed transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 w-fit flex items-center gap-2"
          >
            {generating ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Generate Refactor Plan"
            )}
          </button>
          {error && <p className="text-error text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  const completedCount = plan.steps.filter(
    (s) => s.status === "applied",
  ).length;
  const progressPercent = Math.round(
    (completedCount / plan.steps.length) * 100,
  );

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-content">Refactor Plan</h1>
        <p className="text-sm text-base-content/55">
          {completedCount} of {plan.steps.length} steps applied
        </p>
      </div>

      <div className="h-2.5 w-full rounded-full shadow-clay-pressed bg-base-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex flex-col gap-3">
        {plan.steps.map((step) => (
          <div
            key={step._id}
            className={`rounded-[1.25rem] p-4 flex gap-4 items-start transition-all duration-200 ${
              step.status === "applied"
                ? "bg-base-200 shadow-clay-pressed"
                : "bg-linear-to-br from-base-100 to-base-200 shadow-clay-sm hover:shadow-clay"
            }`}
          >
            <input
              type="checkbox"
              checked={step.status === "applied"}
              onChange={() => handleToggleStep(step._id, step.status)}
              disabled={updatingStepId === step._id}
              className="checkbox checkbox-primary mt-1"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-sm badge-neutral">
                  #{step.order}
                </span>
                <span className="font-display font-semibold text-sm text-base-content">
                  {step.action}
                </span>
                <span className="font-mono text-xs text-base-content/45 truncate">
                  {step.target}
                </span>
              </div>
              <p
                className={`text-sm mt-1 ${step.status === "applied" ? "text-base-content/40 line-through" : "text-base-content/75"}`}
              >
                {step.description}
              </p>
            </div>

            <span className="text-xs text-base-content/45 whitespace-nowrap">
              Impact {step.impactScore}
            </span>
          </div>
        ))}
      </div>

      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
};

export default Refactoring;