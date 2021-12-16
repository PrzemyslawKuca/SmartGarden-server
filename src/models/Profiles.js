import mongoose from "mongoose";

export const Profiles = mongoose.model("profiles", {
    name: String,
    schedule: [{
        air_humidity: Number,
        soil_humidity: Number,
        air_temperature: Number,
        air_presuer: Number,
        light: {
            start_date: String,
            end_date: String
        },
        start_date: String,
        end_date: String,
    }],
    created_at: String,
    updated_at: String
});