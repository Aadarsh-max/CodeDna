import { Repository } from "../models/Repository.js";
import { AnalysisResult } from "../models/AnalysisResult.js";
import {
  parseRepository,
  predictRisk,
  computeFuzzyScore,
  generateRefactorPlan,
  explainPredictions,
  generateDocumentation,
  getDependencyGraph,
} from "../services/aiServiceClient.js";

const runAnalysisPipeline = async (analysisId, repository) => {
  try {
    await AnalysisResult.findByIdAndUpdate(analysisId, { status: "running" });

    const parsed = await parseRepository({
      githubUrl: repository.githubUrl,
      zipPath: repository.zipPath,
      source: repository.source,
    });

    const graph = await getDependencyGraph({
      githubUrl: repository.githubUrl,
      zipPath: repository.zipPath,
      source: repository.source,
    });

    const predictions = await predictRisk(parsed);
    const maintainabilityScore = await computeFuzzyScore(parsed.metrics);
    const refactorPlan = await generateRefactorPlan(parsed.metrics);
    const explanations = await explainPredictions(parsed.metrics);

    const documentation = await generateDocumentation({
      repoName: parsed.repo_name,
      metrics: parsed.metrics,
      averageBugProbability: predictions.average_bug_probability,
      highRiskFileCount: predictions.high_risk_file_count,
      averageMaintainability: maintainabilityScore.average_maintainability,
      topRefactorActions: refactorPlan.slice(0, 5).map((step) => `${step.action} on ${step.target}`),
    });

    await AnalysisResult.findByIdAndUpdate(analysisId, {
      status: "completed",
      metrics: parsed.metrics,
      graph,
      riskModules: predictions,
      maintainabilityScore,
      refactorPlan,
      explanations,
      documentation,
    });
  } catch (error) {
    await AnalysisResult.findByIdAndUpdate(analysisId, {
      status: "failed",
      error: error.message,
    });
  }
};

export const startAnalysis = async (req, res) => {
  const repository = await Repository.findOne({
    _id: req.params.repoId,
    user: req.user._id,
  });

  if (!repository) {
    res.status(404);
    throw new Error("Repository not found");
  }

  const analysis = await AnalysisResult.create({
    repository: repository._id,
    user: req.user._id,
    status: "pending",
  });

  runAnalysisPipeline(analysis._id, repository);

  res.status(202).json(analysis);
};

export const getAnalysisById = async (req, res) => {
  const analysis = await AnalysisResult.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!analysis) {
    res.status(404);
    throw new Error("Analysis not found");
  }

  res.status(200).json(analysis);
};

export const getAnalysesByRepo = async (req, res) => {
  const analyses = await AnalysisResult.find({
    repository: req.params.repoId,
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.status(200).json(analyses);
};