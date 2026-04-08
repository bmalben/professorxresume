import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobRole: { type: String, required: true },
    jobDescription: { type: String, default: "" },
    resumeText: { type: String, default: "" },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    score: { type: Number, default: null },
    questionTarget: { type: Number, default: 8 },
  },
  { timestamps: true }
);

export const Interview = mongoose.model("Interview", interviewSchema);
