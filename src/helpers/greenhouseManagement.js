import {bmp180Sensor} from '../middleware/bmp180.middleware.js';
import {mcp3008Module} from '../middleware/mcp3008.middleware.js'
import {dhtSensor} from '../middleware/dht.middleware.js';
import fs from "fs";
import {SensorReading} from "../models/SensorReading.js";

import { Settings } from "../models/Settings.js";
import { Profiles } from "../models/Profiles.js";
import { ManualProfile } from "../models/ManualProfile.js";

import {getCurrentHour, calculateDaysBetween} from '../helpers/timeFormat.js';

import { waterPump } from "../middleware/waterPump.middleware.js";
import { light } from "../middleware/light.middleware.js";
import { fan } from "../middleware/fan.middleware.js";

export const greenhouseManagement = async () => {
    let air_humidity = 0;
    let soil_humidity = 0;
    let air_temperature = 0;
    let light_level = 0;

    await dhtSensor.getHumidity().then((humidity) => {
      air_humidity = humidity
    })

    await mcp3008Module.getMoistureLevel().then((moisture) => {
      soil_humidity = moisture
    })

    await bmp180Sensor.getTemperature().then((temperature) => {
      air_temperature = temperature
    })

    await mcp3008Module.getLightLevel().then((light) => {
      light_level = light
    })
  
    const settings = await Settings.find({}).exec()

    if(settings[0].mode === 'plan'){
        const profiles = await Profiles.find({'_id': settings[0].current_plan}).exec()
        let duration = calculateDaysBetween(new Date(), profiles[0].started_at)
        let currentStage = null;
        let daysCount = 0;

        profiles[0].schedule.forEach((item, i)=>{
          daysCount += parseInt(item.duration);
          if(daysCount >= duration && currentStage === null){
            currentStage = i
          }
        })

        if(currentStage){
          if(air_humidity < profiles[0].schedule[currentStage].air_humidity && settings[0].fan){
            fan(1000)
          }
    
          if(soil_humidity < profiles[0].schedule[currentStage].soil_humidity && settings[0].pump){
            waterPump(25)
          }
    
          if(air_temperature < profiles[0].schedule[currentStage].air_temperature && settings[0].fan){
            fan(1000)
          }
    
          if(light_level < profiles[0].schedule[currentStage].light_level && getCurrentHour() > profiles[0].schedule[currentStage].light.start_hour && getCurrentHour() < profiles[0].schedule[currentStage].light.end_hour && settings[0].light){
            light(true);
          }else{
            light(false);
          }
        }
    }

    if(settings[0].mode === 'manual'){
      const manualProfile = await ManualProfile.findOne({}).exec()

      if(air_humidity > manualProfile.air_humidity && settings[0].fan){
        fan(1000)
      }

      if(soil_humidity < manualProfile.soil_humidity && settings[0].pump){
        waterPump(500)
      }

      if(air_temperature > manualProfile.air_temperature && settings[0].fan){
        fan(1000)
      }

      if(light_level < manualProfile.light.minimumLevel && getCurrentHour() > manualProfile.light.start_hour && getCurrentHour() < manualProfile.light.end_hour && settings[0].light){
        light(true);
      }else{
        light(false);
      }
    }

}