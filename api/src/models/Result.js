import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, unique: true },
    score: { type: Number, required: true },
    feedback: { type: String, required: true },
  },
  { timestamps: true }
);

export const Result = mongoose.model("Result", resultSchema);
