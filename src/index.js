//  import {bmp180Sensor} from './middleware/bmp180.middleware.js';
// import {mcp3008Module} from './middleware/mcp3008.middleware.js'
// import {dhtSensor} from './middleware/dht.middleware.js';
// import fs from "fs";

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
    // token has been invalidated
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

  // var temp = 0;
  // var temp2 = 0;
  // var hum = 0;
  // var pres = 0;
  // var temp_c = 0;
  // var water = 0;
  // var processor = 0
  
  
  // function sensorsUpdate() {
  //   // bmp180Sensor.getTemperature().then((temperature) => {
  //   //   temp = temperature
  //   // })
  
  //   // bmp180Sensor.getPressure().then((pressure) => {
  //   //   pres = pressure
  //   // })
  
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


  app.listen({port: 4000}, () =>
          console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();