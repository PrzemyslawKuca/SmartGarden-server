import mongoose from "mongoose";

export const User = mongoose.model("users", { name: String, email: String, password: String, confirmed: Boolean, confirmed_by_admin: Boolean, notifications: Boolean, notifications_alerts: Boolean, role: String, created_at: String, updated_at: String });
