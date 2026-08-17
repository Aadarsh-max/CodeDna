import mongoose from "mongoose";

const analysisResultSchema = new mongoose.Schema(
  {
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    metrics: mongoose.Schema.Types.Mixed,
    riskModules: mongoose.Schema.Types.Mixed,
    maintainabilityScore: mongoose.Schema.Types.Mixed,
    refactorPlan: mongoose.Schema.Types.Mixed,
    explanations: mongoose.Schema.Types.Mixed,
    documentation: mongoose.Schema.Types.Mixed,
    graph: mongoose.Schema.Types.Mixed,
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

export const AnalysisResult = mongoose.model("AnalysisResult", analysisResultSchema);