import {bmp180Sensor} from '../middleware/bmp180.middleware.js';
import {mcp3008Module} from '../middleware/mcp3008.middleware.js'
import {dhtSensor} from '../middleware/dht.middleware.js';
import fs from "fs";
import {SensorReading} from "../models/SensorReading.js";

export const saveSensorsRead = async () => {
    let air_humidity = 0;
    let soil_humidity = 0;
    let air_temperature = 0;
    let air_pressure = 0;
    let light_level = 0;
    let cpu_temperature = 0;

    // await dhtSensor.getHumidity().then((humidity) => {
    //   air_humidity = humidity
    // })

    await mcp3008Module.getMoistureLevel().then((moisture) => {
      soil_humidity = moisture
    })

    await bmp180Sensor.getTemperature().then((temperature) => {
      air_temperature = temperature
    })

    await bmp180Sensor.getPressure().then((pressure) => {
        air_pressure = pressure
    })

    await mcp3008Module.getLightLevel().then((light) => {
      light_level = light
    })
  
    let tempFile = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
    cpu_temperature = tempFile / 1000;

    let newSensorReading = new SensorReading({
        air_humidity,
        soil_humidity,
        air_temperature,
        air_pressure,
        light_level,
        cpu_temperature,
        created_at: new Date().toISOString()
    })

    await newSensorReading.save()
}