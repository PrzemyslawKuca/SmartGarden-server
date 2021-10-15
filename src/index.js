// import express from 'express';
// import config from './config.js';
// import {
//   bmp180Sensor
// } from './middleware/bmp180.middleware.js'
// import {
//   mcp3008Module
// } from './middleware/mcp3008.middleware.js'
// import {
//   dhtSensor
// } from './middleware/dht.middleware.js'

// const app = express()

// import fs from "fs";

// var temp = 0;
// var temp2 = 0;
// var hum = 0;
// var pres = 0;
// var temp_c = 0;
// var water = 0;
// var processor = 0


// function sensorsUpdate() {
//   bmp180Sensor.getTemperature().then((temperature) => {
//     temp = temperature
//   })

//   bmp180Sensor.getPressure().then((pressure) => {
//     pres = pressure
//   })

//   mcp3008Module.getMoistureLevel().then((moisture) => {
//     water = moisture
//   })

//   dhtSensor.getTemperature().then((temperature) => {
//     temp2 = temperature
//   })

//   dhtSensor.getHumidity().then((humidity) => {
//     hum = humidity
//   })

//   var tempFile = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
//   temp_c = tempFile / 1000;
// }

// setInterval(sensorsUpdate, 1000);


// app.get('/', (req, res) => {
//   res.send(`woda: ${water}%, temperatura: ${temp}°C, wilgotność: ${hum}% <br/> temperatura: ${temp2}°C, ciśnienie: ${pres.toFixed(2)} hPa <br/>Core temp: ${temp_c}°C`)
// })

// app.listen(config.port, () => {
//   console.log(`Example app listening at http://localhost:${config.port}`)
// })

import {
  ApolloServer,
  gql
} from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";
import {
  resolvers
} from "./resolvers.js";
import {
  typeDefs
} from "./typeDefs.js";

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await mongoose.connect("mongodb+srv://SmartGarden:oNwPw0zdqTgIt413@smartgarden.yuao3.mongodb.net/smartGarden?retryWrites=true&w=majority");

  await server.start()

  server.applyMiddleware({
    app,
    path: '/graphql',
    cors: true,
    onHealthCheck: () =>
      // eslint-disable-next-line no-undef
      new Promise((resolve, reject) => {
        if (mongoose.connection.readyState > 0) {
          resolve();
        } else {
          reject();
        }
      }),
  });

  app.listen({
      port: 4000
    }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();