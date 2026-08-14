import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
      type: String,
      enum: ["github", "zip"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
    zipPath: {
      type: String,
    },
    defaultBranch: {
      type: String,
    },
    language: {
      type: String,
    },
    status: {
      type: String,
      enum: ["imported", "failed"],
      default: "imported",
    },
  },
  { timestamps: true }
);

export const Repository = mongoose.model("Repository", repositorySchema);