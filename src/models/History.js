import mongoose from "mongoose";

export const History = mongoose.model("history", { comment: String, created_at: String });
