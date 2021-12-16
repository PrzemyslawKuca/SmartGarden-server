import mongoose from "mongoose";

export const SensorReading = mongoose.model("sensor_readings", { 
    air_humidity: Number,
    soil_humidity: Number,
    air_temperature: Number,
    air_pressure: Number,
    light_level: Number,
    cpu_temperature: Number,
    created_at: String,
});