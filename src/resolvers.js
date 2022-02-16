import dotenv from 'dotenv'
dotenv.config()

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthenticationError } from 'apollo-server-express';
import { User } from "./models/User.js";
import { SensorReading } from "./models/SensorReading.js";
import { Settings } from "./models/Settings.js";
import { Profiles } from "./models/Profiles.js";
import { ManualProfile } from "./models/ManualProfile.js";
import { History } from "./models/History.js";
import { createTokens } from "./auth.js";
import { transporter } from './helpers/nodemailer.js';
import { registerEmailBody } from "./assets/registerEmailBody.js";
import {resetPasswordEmailBody} from './assets/resetPasswordEmailBody.js'

export const resolvers = {
  Query: {
    me: (_, __, { res, req }) => {
      // if (!req.userId) {
      //   throw new AuthenticationError('Unauthenticated');
      // }
      return User.findOne({
        id: req.userId
      }).exec();
    },
    users: (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return User.find({}).exec();
    },
    sensorReads: (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      if(req.body.variables.start_date && req.body.variables.end_date){
        return SensorReading.find({'created_at': {
          $gte: req.body.variables.start_date, 
          $lt: req.body.variables.end_date
        }}).exec();

        // return SensorReading.find({}).exec();

      }
      
      return SensorReading.find({}).exec();
    },
    lastSensorsReading: (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return SensorReading.findOne().sort({
        'created_at': -1
      }).exec();
    },
    settings: (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return Settings.findOne({}).exec();
    },
    profiles: (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      if(req.body.variables.id){
        return Profiles.find({'_id': req.body.variables.id}).exec();
      }

      return Profiles.find({}).exec();
    },
    manualProfile: (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      return ManualProfile.findOne({}).exec();

    },
    history: async (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      let historyData = await History.find({}).skip(req.body.variables.offset).limit(req.body.variables.limit);
      let historyTotalaLength = await History.find({}).count().exec();

      return {
        totalLength: historyTotalaLength,
        hasMore: historyTotalaLength > (req.body.variables.offset + req.body.variables.limit),
        history: historyData
      }
    },
  },
  Mutation: {
    register: async (_, { email, password, name }) => {

      const user = await User.find({
        'email': email
      }).exec();

      if (user.length == 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          confirmed: false,
          role: 'ADMIN',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await newUser.save(() => {
          jwt.sign({
            user: email
          },
            process.env.EMAIL_SECRET, {
            expiresIn: '1d',
          },
            (err, emailToken) => {
              transporter.sendMail({
                from: '"Smart Garden" <smartfarmpwsz@gmail.com>',
                to: email,
                subject: 'Confirm Email',
                html: registerEmailBody(emailToken),
              });
            },
          );
        });
        return true;
      }
      throw new Error('Email already in use')
    },
    login: async (_, { email, password }, { res }) => {
      const user = await User.findOne({
        'email': email
      }).exec();

      if (!user) {
        throw new Error('User not found')
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        throw new Error('Password not valid');
      }

      if (!user.confirmed) {
        throw new Error('User not confirmed');
      }

      const {
        accessToken,
        refreshToken
      } = createTokens(user);

      res.cookie("refresh-token", refreshToken);
      res.cookie("access-token", accessToken);

      return {
        access_token: accessToken,
        refresh_token: refreshToken
      };
    },
    confirmProfile:async (_, { email }, { res, req }) => {
      const { user } = jwt.verify(req.params.token, process.env.EMAIL_SECRET);
      await User.updateOne({ 'email': user }, {confirmed: true});

      return true;
    },
    resetPassword: async (_, { email }, { res, req }) => {
      const user = await User.findOne({
        'email': email
      }).exec();

      let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let passwordLength = 12;
      let password = "";

      for (var i = 0; i <= passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.updateOne({
        '_id': user._id
      }, {
        password: hashedPassword
      });

      transporter.sendMail({
        to: email,
        subject: 'Reset password',
        html: resetPasswordEmailBody(password),
      });

      return true;
    },
    editUser: async (_, { name, email, password }, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const emailExist = await User.findOne({
        email: email
      });

      if (req.userId != emailExist.id) {
        throw new Error("Email exists")
      }


      await User.updateOne({
        _id: req.userId
      }, {
        name: name,
        email: email,
        password: password
      });

      const savedUser = await User.findOne({
        _id: req.userId
      });
      return savedUser;
    },
    setupSettings: async (_, { mode, interval }, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const existingSettings = await Settings.find({}).exec();
      if (existingSettings.length > 0) {
        throw new Error('Settings already exist')
      }

      const settings = new Settings({
        mode,
        interval,
        pump: false,
        pump_fertilizer: false,
        light: false,
        fan: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      await settings.save();

      return settings;
    },
    deleteUser: async (_, { id }, { res, req }) => {
      try {
        await User.deleteOne({
          _id: id
        }).exec();
        return true;
      } catch {
        return false;
      }

    },
    addUser: async (_, { email, name }, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const user = await User.find({
        'email': email
      }).exec();

      if (user.length == 0) {
        let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let passwordLength = 12;
        let password = "";

        for (var i = 0; i <= passwordLength; i++) {
          var randomNumber = Math.floor(Math.random() * chars.length);
          password += chars.substring(randomNumber, randomNumber + 1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          confirmed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await newUser.save(() => {
          jwt.sign({
            user: email
          },
            process.env.EMAIL_SECRET, {
            expiresIn: '1d',
          },
            (err, emailToken) => {
              const url = `http://localhost:4000/confirmation/${emailToken}`;

              transporter.sendMail({
                from: '"Smart Garden" <smartfarmpwsz@gmail.com>',
                to: email,
                subject: 'Confirm Email',
                html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
              });
            },
          );
        });

        return true;
      }
    },
    updateSettings: async (_, { mode, interval, pump, current_plan, pump_fertilizer, light, fan }, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      await Settings.updateOne({}, {
        mode: mode,
        interval: interval,
        current_plan: current_plan,
        pump: pump,
        pump_fertilizer: pump_fertilizer,
        light: light,
        fan: fan,
        updated_at: new Date().toISOString()
      }).exec();

      const savedSettings = await Settings.findOne({});

      if(current_plan){
        await Profiles.updateOne({'_id': current_plan}, {
          started_at: new Date().toISOString()
        })
      }

      return savedSettings;
    },
    addProfile: async (_, { name, schedule }, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const profile = new Profiles({
        name: name,
        schedule: schedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      await profile.save();

      return profile

    },
    addManualProfile: async (_, { air_humidity, soil_humidity, air_temperature, light}, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const existingManualProfile = await ManualProfile.find({}).exec();

      if(existingManualProfile.length > 0){
        await ManualProfile.updateOne({}, {
          air_humidity: air_humidity, 
          soil_humidity: soil_humidity, 
          air_temperature: air_temperature, 
          light: light,
          updated_at: new Date().toISOString(),
        }).exec();

        return await ManualProfile.find({}).exec();
      }else{
        const manualProfile = new ManualProfile({
          air_humidity: air_humidity, 
          soil_humidity: soil_humidity, 
          air_temperature: air_temperature, 
          light: light,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        await manualProfile.save();
  
        return manualProfile
      }

    },
    editProfile: async (_, { id, name, schedule }, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      await Profiles.updateOne({
        id: id
      }, {
        name: name,
        schedule: schedule,
        updated_at: new Date().toISOString(),
      });

      const savedProfile = await Profiles.findOne({
        id: id
      });
      return savedProfile;

    },
    deleteProfile: async (_, { id }, { res, req }) => {
      try {
        await Profiles.deleteOne({
          _id: id
        }).exec();
        return true;
      } catch {
        return false;
      }

    },
  }
};