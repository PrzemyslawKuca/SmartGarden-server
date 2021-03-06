import mongoose from "mongoose";

export const ManualProfile = mongoose.model("manual_profile", {
    air_humidity: Number,
    soil_humidity: Number,
    air_temperature: Number,
    air_presuer: Number,
    light: {
        start_hour: String,
        end_hour: String,
        minimumLevel: Number,
    },
    fertilizer: Number,
    fertilizer_interval: Number,
    created_at: String,
    updated_at: String
});