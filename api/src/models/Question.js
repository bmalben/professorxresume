import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, index: true },
    text: { type: String, required: true },
    order: { type: Number, required: true },
    difficulty: { type: String, default: "" },
    source: {
      provider: { type: String, default: "gemini" },
      model: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
