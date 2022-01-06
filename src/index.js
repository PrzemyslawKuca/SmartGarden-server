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
import {User} from "./models/User.js";
import config from './config.js';

import { saveSensorsRead } from "./helpers/saveSensorsRead.js";
// import { waterPump } from "./middleware/waterPump.middleware.js";

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
  
  setInterval(async() => {
    saveSensorsRead()
    settings = await Settings.findOne({}).exec()
  }, settings.interval * 60 * 1000); // Every 10 mins = 10 * 60 * 1000

  // setInterval(()=>{
    // waterPump()
  // }, 10000)

  app.get('/confirmation/:token', async (req, res) => {
    try {
      const { user } = jwt.verify(req.params.token, process.env.EMAIL_SECRET);
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