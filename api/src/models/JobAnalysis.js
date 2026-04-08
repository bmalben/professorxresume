import mongoose from "mongoose";

const jobAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, required: true },
    descriptionSnippet: { type: String, default: "" },
    generatedSummary: { type: String, required: true },
  },
  { timestamps: true }
);

export const JobAnalysis = mongoose.model("JobAnalysis", jobAnalysisSchema);
