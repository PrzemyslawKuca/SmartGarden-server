import mongoose from "mongoose";

export const Settings = mongoose.model("settings", {
    mode: String,
    interval: Number,
    pump: Boolean,
    pump_fertilizer: Boolean,
    light: Boolean,
    fan: Boolean,
    created_at: String,
    updated_at: String
});