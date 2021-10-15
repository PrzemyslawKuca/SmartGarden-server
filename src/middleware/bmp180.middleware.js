import bmp180 from 'bmp180-sensor';

const sensor = await bmp180({
    address: 0x77,
    mode: 1
})

export const bmp180Sensor = {
    getTemperature: function () {
        return new Promise((resolve, reject) => {
            sensor.read().then((data) => {
                resolve(data.temperature)
            })
        })
    },
    getPressure: function () {
        return new Promise((resolve, reject) => {
            sensor.read().then((data) => {
                resolve(data.pressure / 97.060200)
            })
        })
    },
};