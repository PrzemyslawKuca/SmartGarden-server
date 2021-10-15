import dht from "node-dht-sensor";

export const dhtSensor = {
    getTemperature: function () {
        return new Promise((resolve, reject) => {
            dht.read(11, 4, function (err, temperature, humidity) {
                if (!err) {
                    resolve(temperature)
                }
            });
        })
    },
    getHumidity: function () {
        return new Promise((resolve, reject) => {
            dht.read(11, 4, function (err, temperature, humidity) {
                if (!err) {
                    resolve(humidity)
                }
            });
        })
    },
};