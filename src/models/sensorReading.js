import mongoose from "mongoose";

export const SensorReading = mongoose.model("SensorReading", { name: String });