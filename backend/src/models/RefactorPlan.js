import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  order: Number,
  action: String,
  target: String,
  description: String,
  impactScore: Number,
  status: {
    type: String,
    enum: ["pending", "applied"],
    default: "pending",
  },
});

const refactorPlanSchema = new mongoose.Schema(
  {
    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnalysisResult",
      required: true,
    },
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
    steps: [stepSchema],
  },
  { timestamps: true }
);

export const RefactorPlan = mongoose.model("RefactorPlan", refactorPlanSchema);