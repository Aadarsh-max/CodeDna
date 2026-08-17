import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import reportApi from "../services/reportApi.js";

const Refactoring = () => {
  const { analysisId } = useParams();
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
      setError(err.response?.data?.message || "Failed to generate refactor plan");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStep = async (stepId, currentStatus) => {
    const nextStatus = currentStatus === "applied" ? "pending" : "applied";
    setUpdatingStepId(stepId);

    try {
      const updatedPlan = await reportApi.updateStepStatus(plan._id, stepId, nextStatus);
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
    return <p className="text-error">{error}</p>;
  }

  const draft = report?.refactorPlanDraft || [];

  if (!plan && draft.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">Refactor Plan</h1>
        <p className="text-sm opacity-60">No refactoring actions were suggested — this codebase looks clean.</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Refactor Plan</h1>
          <p className="text-sm opacity-60">{draft.length} suggested actions found, ordered by the genetic algorithm.</p>
        </div>

        <div className="bg-base-200 border border-base-300 rounded-box p-6 flex flex-col gap-4">
          <p className="text-sm opacity-80">
            Generate a tracked refactor plan to check off steps as you apply them.
          </p>
          <button onClick={handleGenerate} disabled={generating} className="btn btn-primary w-fit">
            {generating ? <span className="loading loading-spinner loading-sm"></span> : "Generate Refactor Plan"}
          </button>
          {error && <p className="text-error text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  const completedCount = plan.steps.filter((s) => s.status === "applied").length;
  const progressPercent = Math.round((completedCount / plan.steps.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Refactor Plan</h1>
        <p className="text-sm opacity-60">{completedCount} of {plan.steps.length} steps applied</p>
      </div>

      <progress className="progress progress-primary w-full" value={progressPercent} max="100"></progress>

      <div className="flex flex-col gap-3">
        {plan.steps.map((step) => (
          <div
            key={step._id}
            className={`bg-base-200 border rounded-box p-4 flex gap-4 items-start transition-colors ${
              step.status === "applied" ? "border-primary/40" : "border-base-300"
            }`}
          >
            <input
              type="checkbox"
              checked={step.status === "applied"}
              onChange={() => handleToggleStep(step._id, step.status)}
              disabled={updatingStepId === step._id}
              className="checkbox checkbox-primary mt-1"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-sm badge-neutral">#{step.order}</span>
                <span className="font-display font-semibold text-sm">{step.action}</span>
                <span className="font-mono text-xs opacity-50">{step.target}</span>
              </div>
              <p className={`text-sm mt-1 ${step.status === "applied" ? "opacity-50 line-through" : "opacity-80"}`}>
                {step.description}
              </p>
            </div>

            <span className="text-xs opacity-50 whitespace-nowrap">Impact {step.impactScore}</span>
          </div>
        ))}
      </div>

      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
};

export default Refactoring;