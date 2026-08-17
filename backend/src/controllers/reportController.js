import { AnalysisResult } from "../models/AnalysisResult.js";
import { RefactorPlan } from "../models/RefactorPlan.js";

export const getReport = async (req, res) => {
  const analysis = await AnalysisResult.findOne({
    _id: req.params.analysisId,
    user: req.user._id,
  }).populate("repository");

  if (!analysis) {
    res.status(404);
    throw new Error("Analysis not found");
  }

  const refactorPlan = await RefactorPlan.findOne({ analysis: analysis._id });

  res.status(200).json({
    repository: analysis.repository,
    status: analysis.status,
    metrics: analysis.metrics,
    riskModules: analysis.riskModules,
    maintainabilityScore: analysis.maintainabilityScore,
    explanations: analysis.explanations,
    documentation: analysis.documentation,
    refactorPlanDraft: analysis.refactorPlan,
    graph: analysis.graph,
    refactorPlan,
  });
};

export const createRefactorPlan = async (req, res) => {
  const analysis = await AnalysisResult.findOne({
    _id: req.params.analysisId,
    user: req.user._id,
  });

  if (!analysis) {
    res.status(404);
    throw new Error("Analysis not found");
  }

  if (!analysis.refactorPlan) {
    res.status(400);
    throw new Error("No refactor plan available for this analysis");
  }

  const existingPlan = await RefactorPlan.findOne({ analysis: analysis._id });

  if (existingPlan) {
    res.status(400);
    throw new Error("Refactor plan already exists for this analysis");
  }

  const steps = analysis.refactorPlan.map((step, index) => ({
    order: index + 1,
    action: step.action,
    target: step.target,
    description: step.description,
    impactScore: step.impactScore,
  }));

  const plan = await RefactorPlan.create({
    analysis: analysis._id,
    repository: analysis.repository,
    user: req.user._id,
    steps,
  });

  res.status(201).json(plan);
};

export const updateStepStatus = async (req, res) => {
  const { status } = req.body;

  const plan = await RefactorPlan.findOne({
    _id: req.params.planId,
    user: req.user._id,
  });

  if (!plan) {
    res.status(404);
    throw new Error("Refactor plan not found");
  }

  const step = plan.steps.id(req.params.stepId);

  if (!step) {
    res.status(404);
    throw new Error("Step not found");
  }

  step.status = status;
  await plan.save();

  res.status(200).json(plan);
};