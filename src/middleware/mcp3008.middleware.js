import spi from 'spi-device';
import {History} from '../models/History.js';

const messageMoisture = [{
    sendBuffer: Buffer.from([0x01, 0x80 + (5 << 4), 0x00]), // (chanel << 4)
    receiveBuffer: Buffer.alloc(3),
    byteLength: 3,
    speedHz: 20000
}];

const messageLight = [{
    sendBuffer: Buffer.from([0x01, 0x80 + (4 << 4), 0x00]),
    receiveBuffer: Buffer.alloc(3),
    byteLength: 3,
    speedHz: 20000
}];

export const mcp3008Module = {
    getMoistureLevel: function () {
        return new Promise((resolve, reject) => {
            const mcp3008 = spi.open(0, 0, err => {
                if (err) throw err;
                mcp3008.transfer(messageMoisture, (err, messageMoisture) => {
                    if(!err){
                        const rawValue = ((messageMoisture[0].receiveBuffer[1] & 0x03) << 8) +
                        messageMoisture[0].receiveBuffer[2];
                        const voltage = rawValue * 3.3 / 1023;
                        const percent = ((3.3 - voltage) / 3.3) * 100 ;
                        resolve(parseFloat(percent.toFixed(2)))
                    }
                    else{
                        const newHistory= new History({
                            comment: `mcp3008: Czujnik wilgotności gleby nie odpowiada. Error: ${err}`,
                            created_at: new Date().toISOString(),
                        });
                        newHistory.save()
                    }
                    // if (err) throw err;
                });
            });
        })
    },
    getMoistureVoltage: function () {
        return new Promise((resolve, reject) => {
            const mcp3008 = spi.open(0, 0, err => {
                if (err) throw err;
                mcp3008.transfer(messageMoisture, (err, messageMoisture) => {
                    if (err) throw err;
                    const rawValue = ((messageMoisture[0].receiveBuffer[1] & 0x03) << 8) +
                    messageMoisture[0].receiveBuffer[2];
                    const voltage = rawValue * 3.3 / 1023;
                    resolve(parseFloat(voltage.toFixed(2)))
                });
            });
        })
    },
    getLightLevel: function (){
        return new Promise((resolve, reject) => {
            const mcp3008 = spi.open(0, 0, err => {
                if (err) throw err;
                mcp3008.transfer(messageLight, (err, messageLight) => {
                    if(!err){
                        const rawValue = ((messageLight[0].receiveBuffer[1] & 0x03) << 8) +
                        messageLight[0].receiveBuffer[2];
                        const voltage = rawValue * 3.3 / 1023;
                        const percent = ((3.3 - voltage) / 3.3) * 100 ;
                        resolve(parseFloat(percent.toFixed(2)))
                    }else{
                        const newHistory= new History({
                            comment: `mcp3008: Czujnik oświetlenia nie odpowiada. Error: ${err}`,
                            created_at: new Date().toISOString(),
                        });
                        newHistory.save()
                    }
                    // if (err) throw err;
                });
            });
        })
    },
    getLightVoltage: function (){
        return new Promise((resolve, reject) => {
            const mcp3008 = spi.open(0, 0, err => {
                if (err) throw err;
                mcp3008.transfer(messageLight, (err, messageLight) => {
                    if (err) throw err;
                    const rawValue = ((messageLight[0].receiveBuffer[1] & 0x03) << 8) +
                        messageLight[0].receiveBuffer[2];
                    const voltage = rawValue * 3.3 / 1023;
                    resolve(parseFloat(voltage.toFixed(2)))
                });
            });
        })
    }
};