import mongoose from "mongoose";

export const User = mongoose.model("Users", { name: String, email: String, password: String, confirmed: Boolean, created_at: String, updated_at: String});
