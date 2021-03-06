import dht from "node-dht-sensor";
import {History} from '../models/History.js';

export const dhtSensor = {
    getTemperature: function () {
        return new Promise((resolve, reject) => {
            dht.read(22, 4, function (err, temperature, humidity) {
                if (!err) {
                    resolve(temperature)
                }
                else{
                    const newHistory= new History({
                        comment: `DHT22: Czujnik temperatury powietrza nie odpowiada. Error: ${err}`,
                        created_at: new Date().toISOString(),
                      });
                    newHistory.save()
                }
            });
        })
    },
    getHumidity: function () {
        return new Promise((resolve, reject) => {
            dht.read(22, 4, function (err, temperature, humidity) {
                if (!err) {
                    resolve(humidity)
                }
                else{
                    const newHistory= new History({
                        comment: `DHT22: Czujnik wilgotności powietrza nie odpowiada. Error: ${err}`,
                        created_at: new Date().toISOString(),
                      });
                    newHistory.save()
                }
            });
        })
    },
};