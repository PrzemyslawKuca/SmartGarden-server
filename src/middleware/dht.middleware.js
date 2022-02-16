import dht from "node-dht-sensor";

export const dhtSensor = {
    getTemperature: function () {
        return new Promise((resolve, reject) => {
            dht.read(22, 4, function (err, temperature, humidity) {
                if (!err) {
                    resolve(temperature)
                }
                else{
                    console.log(err)
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
                    console.log(err)
                }
            });
        })
    },
};