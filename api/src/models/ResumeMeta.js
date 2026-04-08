import mongoose from "mongoose";

const resumeMetaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", default: null },
    filename: { type: String, required: true },
    extractedTextLength: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ResumeMeta = mongoose.model("ResumeMeta", resumeMetaSchema);
