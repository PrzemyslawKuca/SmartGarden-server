import mongoose from "mongoose";

export const User = mongoose.model("users", { name: String, email: String, password: String, confirmed: Boolean, role: String, created_at: String, updated_at: String });
