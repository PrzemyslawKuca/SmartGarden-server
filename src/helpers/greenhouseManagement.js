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
import {History} from '../models/History.js';

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

    await dhtSensor.getTemperature().then((temperature) => {
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

        if(currentStage != null){
          if((air_humidity > profiles[0].schedule[currentStage].air_humidity && settings[0].fan) || (air_temperature > profiles[0].schedule[currentStage].air_temperature && settings[0].fan)){
            let time = 0
            
            if(air_temperature > profiles[0].schedule[currentStage].air_temperature){
              time += (air_temperature - profiles[0].schedule[currentStage].air_temperature);
            }

            if(air_humidity > profiles[0].schedule[currentStage].air_humidity){
              time += (air_humidity - profiles[0].schedule[currentStage].air_humidity);
            }

            if(time > 60){
              time = 60
            }
            
            fan(time)
            const newHistory= new History({
              comment: `Plan: Uruchomiono wentylacj?? na ${time.toFixed(2)}s`,
              created_at: new Date().toISOString(),
            });
            await newHistory.save()
          }
    
          if(soil_humidity < profiles[0].schedule[currentStage].soil_humidity && settings[0].pump){
            waterPump(50)
            const newHistory= new History({
              comment: `Plan: Uruchomiono pompe wody (50ml)`,
              created_at: new Date().toISOString(),
            });
            await newHistory.save()
          }
    
          if(light_level < profiles[0].schedule[currentStage].light_level && getCurrentHour() > profiles[0].schedule[currentStage].light.start_hour && getCurrentHour() < profiles[0].schedule[currentStage].light.end_hour && settings[0].light){
            light(true)
            const newHistory= new History({
              comment: `Plan: W????czono o??wietlenie`,
              created_at: new Date().toISOString(),
            });
            await newHistory.save()
          }else{
            light(false)
              const newHistory= new History({
                comment: `Plan: Wy????czono o??wietlenie`,
                created_at: new Date().toISOString(),
              });
              await newHistory.save()
          }
        }
    }

    if(settings[0].mode === 'manual'){
      const manualProfile = await ManualProfile.findOne({}).exec()

      if((air_humidity > manualProfile.air_humidity && settings[0].fan) || (air_temperature > manualProfile.air_temperature && settings[0].fan)){
        let time = 0
        
        if(air_temperature > manualProfile.air_temperature){
          time += (air_temperature - manualProfile.air_temperature);
        }

        if(air_humidity > manualProfile.air_humidity){
          time += (air_humidity - manualProfile.air_humidity);
        }

        if(time > 60){
          time = 60
        }
        
        fan(time)
        const newHistory= new History({
          comment: `Plan: Uruchomiono wentylacj?? na ${time.toFixed(2)}s`,
          created_at: new Date().toISOString(),
        });
        await newHistory.save()
      }

      if(soil_humidity < manualProfile.soil_humidity && settings[0].pump){
        waterPump(50)
        const newHistory= new History({
          comment: `Plan manualny: Uruchomiono pompe wody (50ml)`,
          created_at: new Date().toISOString(),
        });
        await newHistory.save()
      }

      if(light_level < manualProfile.light.minimumLevel && getCurrentHour() > manualProfile.light.start_hour && getCurrentHour() < manualProfile.light.end_hour && settings[0].light){
        light(true)
          const newHistory= new History({
            comment: `Plan manualny: W????czono o??wietlenie`,
            created_at: new Date().toISOString(),
          });
          await newHistory.save()   
      }else{
        light(false)
          const newHistory= new History({
            comment: `Plan manualny: Wy????czono o??wietlenie`,
            created_at: new Date().toISOString(),
          });
          await newHistory.save()
      }
    }

}