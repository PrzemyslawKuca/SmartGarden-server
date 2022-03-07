import dotenv from 'dotenv'
dotenv.config()

import { ApolloServer, AuthenticationError } from "apollo-server-express";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { typeDefs } from "./typeDefs.js";
import { resolvers } from "./resolvers.js";
import { Settings } from "./models/Settings.js";
import { User } from "./models/User.js";
import config from './config.js';

import { saveSensorsRead } from "./helpers/saveSensorsRead.js";
import { greenhouseManagement } from './helpers/greenhouseManagement.js'
import { transporter } from './helpers/nodemailer.js';

import { statsEmailBody } from './assets/statsEmailBody.js';
import moment from 'moment';
import { SensorReading } from './models/SensorReading.js';

const startServer = async () => {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res }),
  });

  await mongoose.connect(process.env.MONGODB_CONNECT);

  app.use(cookieParser());
  app.use(async (req, res, next) => {
    const accessToken = req.headers.authorization || '';

    const token = accessToken.split(" ");

    let decodeToken;

    try {
      decodeToken = await jwt.verify(token[1], process.env.ACCESS_TOKEN_SECRET);
      req.userId = decodeToken.id
      next();
    } catch (err) {
      next();
    }

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

  let settings = await Settings.findOne({}).exec()

  async function sensorsRead(){
    saveSensorsRead()
    settings = await Settings.findOne({}).exec()
    setTimeout(sensorsRead, settings.interval * 60 * 1000)
  }

  async function management(){
    greenhouseManagement()
    setTimeout(management, 10 * 60 * 1000) // Every 10 mins = 10 * 60 * 1000
  }

  function emailNotifications(){
    let now = new Date();
    let delay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0) - now;
    if (delay < 0) {
      delay += 86400000; 
    }

    setTimeout(async ()=>{
      let users = await User.find({}).exec();

      let yesterday = moment().add(-1, 'days').toISOString();
      let sensorsData = await SensorReading.find({created_at: { "$gte": yesterday }});

      let max_temeprature = sensorsData.reduce((acc, item) => acc = acc > item.air_temperature ? acc : item.air_temperature);
      let min_temeprature = sensorsData.reduce((acc, item) => acc = acc < item.air_temperature ? acc : item.air_temperature);

      let max_humidity = sensorsData.reduce((acc, item) => acc = acc > item.air_humidity ? acc : item.air_humidity);
      let min_humidity = sensorsData.reduce((acc, item) => acc = acc < item.air_humidity ? acc : item.air_humidity);
      
      let max_soil_humidity = sensorsData.reduce((acc, item) => acc = acc > item.soil_humidity ? acc : item.soil_humidity);
      let min_soil_humidity = sensorsData.reduce((acc, item) => acc = acc < item.soil_humidity ? acc : item.soil_humidity);

      let formatDateForDisplay = moment(now).format('DD.MM.YYYY')

      users.map((user)=>{
        if(user.notifications){
          transporter.sendMail({
          from: '"Smart Garden" <smartfarmpwsz@gmail.com>',
          to: user.email,
          subject: `Powiadomienie dziene: ${formatDateForDisplay}`,
          html: statsEmailBody(formatDateForDisplay, max_temeprature, min_temeprature, max_humidity, min_humidity, max_soil_humidity, min_soil_humidity),
        });
        }
      })
    }, delay)
  }

  sensorsRead()
  management()
  emailNotifications()

  app.listen({port: config.port}, () =>
          console.log(`🚀 Server ready at http://localhost:${config.port}${server.graphqlPath}`)
  );
};

startServer();