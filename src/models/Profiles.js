import mongoose from "mongoose";

export const Profiles = mongoose.model("profiles", {
    name: String,
    schedule: [{
        air_humidity: Number,
        soil_humidity: Number,
        air_temperature: Number,
        air_presuer: Number,
        light: {
            start_hour: String,
            end_hour: String,
            minimumLevel: Number,
        },
        duration: String,
    }],
    created_at: String,
    updated_at: String
});