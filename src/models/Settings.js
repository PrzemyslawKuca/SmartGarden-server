import mongoose from "mongoose";

export const Settings = mongoose.model("settings", { mode: String, interval: Number, created_at: String, updated_at: String});