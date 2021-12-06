import BMP180 from 'node-bmp180';

const sensor = new BMP180.BMP180({
    address: 0x77,
    mode: BMP180.Mode.UltraHighResolution,
    units: {
        temperature: BMP180.TemperatureUnit.Celsius,
        pressure: BMP180.PressureUnit.Pascal
    }
});



export const bmp180Sensor = {
    getTemperature: async function () {
        const { temperature } = await sensor.read();
        return temperature;
    },
    getPressure: async function () {
        const { pressure } = await sensor.read();
        return (pressure / 100).toFixed(2);
    },
};