import {bmp180Sensor} from '../middleware/bmp180.middleware.js';
import {mcp3008Module} from '../middleware/mcp3008.middleware.js'
import {dhtSensor} from '../middleware/dht.middleware.js';
import fs from "fs";
import {SensorReading} from "../models/SensorReading.js";
import {History} from '../models/History.js';
import { transporter } from './nodemailer.js';
import moment from 'moment';
import {dangerEmailBody} from '../assets/dangerEmailBody.js'
import { User } from "../models/User.js";

async function checkValues(value, min, max, comment){
  if(value > max || value < min){
    const newHistory= new History({
      comment: `${comment}. Warość poza zakresem: ${value}. (min: ${min}, max: ${max}) `,
      created_at: new Date().toISOString(),
    });

    await newHistory.save()

    let formatDateForDisplay = moment(now).format('DD.MM.YYYY')
    let users = await User.find({}).exec();

    users.map((user)=>{
      if(user.notifications_alerts){
        console.log(user.email)
        transporter.sendMail({
          from: '"Smart Garden" <smartfarmpwsz@gmail.com>',
          to: user.email,
          subject: 'Możliwe uszkodzenie jednego z czujników',
          html: dangerEmailBody(formatDateForDisplay, comment),
        });
      }
    })
  }
}

export const saveSensorsRead = async () => {
    let air_humidity = 0;
    let soil_humidity = 0;
    let air_temperature = 0;
    let air_pressure = 0;
    let light_level = 0;
    let cpu_temperature = 0;

    await dhtSensor.getHumidity().then((humidity) => {
      air_humidity = humidity
      checkValues(humidity, 0, 100, 'Wilgotność powietrza')
    })

    await mcp3008Module.getMoistureLevel().then((moisture) => {
      soil_humidity = moisture
      checkValues(moisture, 0, 100, 'Wilgotność gleby')
    })

    await bmp180Sensor.getTemperature().then((temperature) => {
      air_temperature = temperature
      checkValues(temperature, -40, 85, 'Temperatura powietrza')
    })

    await bmp180Sensor.getPressure().then((pressure) => {
        air_pressure = pressure
        checkValues(pressure, 300, 1100, 'Ciśnienie atmosferyczne')
    })

    await mcp3008Module.getLightLevel().then((light) => {
      light_level = light
      checkValues(light, 0, 100, 'Poziom oświetlenia')
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