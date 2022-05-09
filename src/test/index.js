import { expect } from 'chai';
import EasyGraphQLTester from 'easygraphql-tester'
import  {default as request} from 'supertest';

import { bmp180Sensor } from '../middleware/bmp180.middleware.js';
import { dhtSensor } from '../middleware/dht.middleware.js';
import { mcp3008Module } from '../middleware/mcp3008.middleware.js';

import { resolvers } from '../resolvers.js'
import { typeDefs } from '../typeDefs.js'

const userData = {
    email: 'lef27531@zwoho.com',
    password: '123',
    name: 'Jan',
    accesToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyMWU3NzJiZjIzOWUzNDkwZjRjY2VjNSIsImV4cGlyZV9pbiI6MTY1MTcwNjIxMjE5MSwiaWF0IjoxNjUxNjE5ODEyLCJleHAiOjE2NTE3MDYyMTJ9.j8PUQCYmpt4TDDPe3cZjAa8QZHLL9U7Q1TyaYr1BlLU',
    refreshToken: ''
}

describe("Test Sensor", () => {
    describe("Bmp180 sensor", () => {
        it("Temperature is higher than -40 and lower than 85", () => {
            return bmp180Sensor.getTemperature().then((temperature) => {
                expect(temperature).to.gte(-40).to.lte(80);
            })
        })
        it("Pressure is higher than 300 and lower than 1100", () => {
            return bmp180Sensor.getPressure().then((pressure) => {
                expect(pressure).to.gte(300).to.lte(1100);
            })
        })
    });
    describe("DHT-22 sensor", () => {
        it("Temperature is higher than -40 and lower than 80", () => {
            return dhtSensor.getTemperature().then((temperature) => {
                expect(temperature).to.gte(-40).to.lte(80);
            })
        })
        it("Humidity is higher than 0 and lower than 100", () => {
            return dhtSensor.getHumidity().then((humidity) => {
                expect(humidity).to.gte(0).to.lte(100);
            })
        })
    });
    describe("mcp3008 module", () => {
        describe("Capacitive soil moisture v2 sensor", () => {
            it("Moisture is higher than 0 and lower than 100", () => {
                return mcp3008Module.getMoistureLevel().then((moisture) => {
                    expect(moisture).to.gte(0).to.lte(100);
                })
            })
            it("Moisture voltage is higher than 0 and lower than 3.3", () => {
                return mcp3008Module.getMoistureVoltage().then((moistureVoltage) => {
                    expect(moistureVoltage).to.gte(0).to.lte(3.3);
                })
            })
        })
        describe("LM393 sensor", () => {
            it("Light is higher than 0 and lower than 100", () => {
                return mcp3008Module.getLightLevel().then((light) => {
                    expect(light).to.gte(0).to.lte(100);
                })
            })
            it("Light voltage is higher than 0 and lower than 3.3", () => {
                return mcp3008Module.getLightVoltage().then((lightVoltage) => {
                    expect(lightVoltage).to.gte(0).to.lte(3.3);
                })
            })
        })
    });
});

describe("Test Request", () => {
    it("sensorReads", async () => {
        request('http://localhost:4000').post('/graphql')
        .set('Authorization', `Bearer ${userData.accesToken}`)
        .send({ query: '{sensorReads { id air_humidity soil_humidity air_temperature air_pressure light_level cpu_temperature created_at}}' })
        .expect(200)
        .end((error, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.sensorReads).to.be.an('array')
         })

    });

    // it("lastSensorsReading", async () => {
    //     request('http://localhost:4000').post('/graphql')
    //     .set('Authorization', `Bearer ${userData.accesToken}`)
    //     .send({ query: '{lastSensorsReading { id air_humidity soil_humidity air_temperature air_pressure light_level cpu_temperature created_at}}' })
    //     .expect(200)
    //     .end((error, response) => {
    //         expect(response.status).to.equal(200);
    //      })
    // });
})


describe("Test Query Format", () => {
    let tester = new EasyGraphQLTester(typeDefs, resolvers)

    it("settings Query", () => {
        const validQuery  = `
            query Query {
                settings {
                    mode
                    current_plan
                    interval
                    current_plan
                    pump
                    pump_fertilizer
                    light
                    fan
                    created_at
                    updated_at
                  }
            }
        `
        tester.test(true, validQuery)
    })

    it("lastSensorsReading Query", () => {
        const validQuery  = `
            query Query {
                lastSensorsReading{
                    air_humidity
                    soil_humidity
                    air_temperature
                    air_pressure
                    light_level
                    cpu_temperature
                    created_at
                }
            }
        `
        tester.test(true, validQuery)
    })
})

describe("Test Mutation Format", () => {
    let tester = new EasyGraphQLTester(typeDefs)


    it("Register Mutation", () => {
        const mutation = `
            mutation Mutation($email: String!, $password: String!, $name: String!) {
                register(email: $email, password: $password, name: $name)
            }
        `
        tester.mock(mutation, {email: userData.email, password: userData.password, name: userData.name})
    })

    it("Login Mutation", () => {
        const mutation = `
            mutation Mutation($email: String!, $password: String!) {
                login(email: $email, password: $password){
                    access_token
                    refresh_token
                }
            }
        `
        tester.mock(mutation, {email: userData.email, password: userData.password})
    })
})