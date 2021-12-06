import {bmp180Sensor} from './middleware/bmp180.middleware.js';
import {mcp3008Module} from './middleware/mcp3008.middleware.js'
import {dhtSensor} from './middleware/dht.middleware.js';
import fs from "fs";

import { ApolloServer, AuthenticationError } from "apollo-server-express";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { typeDefs } from "./typeDefs.js";
import { resolvers } from "./resolvers.js";
import {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, EMAIL_SECRET} from "./constants.js";
import {createTokens} from "./auth.js";
import {User} from "./models/User.js";
import {SensorReading} from "./models/SensorReading.js";
import config from './config.js';

const startServer = async () => {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res }),
  });

  await mongoose.connect("mongodb+srv://SmartGarden:oNwPw0zdqTgIt413@smartgarden.yuao3.mongodb.net/smartGarden?retryWrites=true&w=majority");

  app.use(cookieParser());
  app.use(async (req, res, next) => {
    const refreshToken = req.cookies["refresh-token"];
    const accessToken = req.cookies["access-token"];
    if (!refreshToken && !accessToken) {
      return next();
    }

    try {
      const data = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
      req.userId = data.userId;
      return next();
    } catch {}

    if (!refreshToken) {
      return next();
    }

    let data;

    try {
      data = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch {
      return next();
    }

    const user = await User.findOne({id: data.userId}).exec();
    if (!user || user.count !== data.count) {
      return next();
    }

    const tokens = createTokens(user);

    res.cookie("refresh-token", tokens.refreshToken);
    res.cookie("access-token", tokens.accessToken);
    req.userId = user.id;

    next();
  });

  await server.start()
  server.applyMiddleware({
    app,
    path: '/graphql',
    cors: true,
    onHealthCheck: () =>
        new Promise((resolve, reject) => {
          if (mongoose.connection.readyState > 0) {
            resolve();
          } else {
            reject();
          }
        }),
  });  
  
  const sensorsUpdate = async () => {
    var air_humidity = 0;
    var soil_humidity = 0;
    var air_temperature = 0;
    var air_presuer = 0;
    var light_level = 0;
    var cpu_temperature = 0;

    await dhtSensor.getHumidity().then((humidity) => {
      air_humidity = humidity
    })

    await mcp3008Module.getMoistureLevel().then((moisture) => {
      soil_humidity = moisture
    })

    await bmp180Sensor.getTemperature().then((temperature) => {
      air_temperature = temperature
    })

    await bmp180Sensor.getPressure().then((pressure) => {
      air_presuer = pressure
    })

    await mcp3008Module.getLightLevel().then((light) => {
      light_level = light
    })
  
    var tempFile = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
    cpu_temperature = tempFile / 1000;

    const newSensorReading = new SensorReading({
      air_humidity,
      soil_humidity,
      air_temperature,
      air_presuer,
      light_level,
      cpu_temperature,
      created_at: new Date().toISOString()
    })

    newSensorReading.save()
  }
  
  setInterval(sensorsUpdate, 10 * 60 * 1000 ); // Every 10 mins

  app.get('/confirmation/:token', async (req, res) => {
    try {
      const { user } = jwt.verify(req.params.token, EMAIL_SECRET);
      await User.updateOne({ 'email': user }, {confirmed: true});
    } catch (e) {
      console.log(e)
      return res.send('error');
    }
  
    // return res.redirect('http://localhost:4000/graphql');
    return res.send('ok');
  })


  app.listen({port: config.port}, () =>
          console.log(`🚀 Server ready at http://localhost:${config.port}${server.graphqlPath}`)
  );
};

startServer();