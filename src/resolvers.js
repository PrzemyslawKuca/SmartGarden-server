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
import {resetPasswordConfirmEmailBody} from './assets/resetPasswordConfirmEmailBody.js'
import {invitationEmailBody} from './assets/invitationEmailBody.js'
import {removeUserEmailBody} from './assets/removeUserEmailBody.js'

export const resolvers = {
  Query: {
    me: (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      return User.findOne({
        _id: req.userId
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
    profile: async (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      if(req.body.variables.id){
        return Profiles.find({'_id': req.body.variables.id}).exec();
      }

      return Profiles.find({}).exec();
    },
    profiles: async (_, __, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      let profilesData = await Profiles.find({}).skip(req.body.variables.offset).limit(req.body.variables.limit);
      let profilesTotalaLength = await Profiles.find({}).count().exec();

      return {
        totalLength: profilesTotalaLength,
        hasMore: profilesTotalaLength > (req.body.variables.offset + req.body.variables.limit),
        profiles: profilesData
      }
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

      let historyData = await History.find({}).sort({created_at: -1}).skip(req.body.variables.offset).limit(req.body.variables.limit);
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
        const totalUsers = await User.find({}).count().exec();

        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          confirmed: false,
          confirmed_by_admin: totalUsers === 0 ? true : false,
          role: totalUsers === 0 ? 'ADMIN' : 'VISITOR',
          notifications: false,
          notifications_alerts: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await newUser.save(() => {
          jwt.sign({
            email: email
          },
            process.env.EMAIL_SECRET, 
            {},
            (err, token) => {
              const url = `http://localhost:3000/email-confirmation?email_token=${token}`;

              transporter.sendMail({
                from: '"Smart Garden" <smartfarmpwsz@gmail.com>',
                to: email,
                subject: 'Potwierdź adres email',
                html: registerEmailBody(url),
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

      if (!user.confirmed_by_admin) {
        throw new Error('User not confirmed by admin');
      }

      const {
        accessToken,
        refreshToken
      } = createTokens(user);

      // res.cookie("refresh-token", refreshToken);
      // res.cookie("access-token", accessToken);

      return {
        access_token: accessToken,
        refresh_token: refreshToken
      };
    },
    confirmEmail: async (_, { token }, { res, req }) => {
      const { email } = jwt.verify(token, process.env.EMAIL_SECRET);
      await User.updateOne({ 'email': email }, {confirmed: true});

      return true;
    },
    resetPassword: (_, { email }, { res, req }) => {
      jwt.sign({
        email: email
      },
        process.env.EMAIL_SECRET, {
        expiresIn: '1d',
      },
        (err, token) => {
          const url = `http://localhost:3000/reset-password?reset_token=${token}`;
          transporter.sendMail({
            from: '"Smart Garden" <smartfarmpwsz@gmail.com>',
            to: email,
            subject: 'Ustaw nowe hasło',
            html: resetPasswordEmailBody(url),
          });
        },
      );

      return true;
    },
    setNewPassword: async (_, {token, password}, { res, req }) => {
      try {
        const { email } = jwt.verify(token, process.env.EMAIL_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);
        const url = `http://localhost:3000/login`;

        await User.updateOne({ 'email': email }, {password: hashedPassword}).then(()=>{
          transporter.sendMail({
            from: '"Smart Garden" <smartfarmpwsz@gmail.com>',
            to: email,
            subject: 'Potwierdzenie zmiany hasła',
            html: resetPasswordConfirmEmailBody(url),
          });
        });
        return true;
      } catch (e) {
        console.log(e)
        return false;
      }
    },
    editUser: async (_, { name, email, password, notifications, notifications_alerts }, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const emailExist = await User.findOne({
        email: email
      });

      if (emailExist && req.userId != emailExist.id) {
        throw new Error("Email exists")
      }

      await User.updateOne({
        _id: req.userId
      }, {
        notifications: notifications, 
        notifications_alerts: notifications_alerts,
        name: name,
        email: email,
        password: password
      });

      const savedUser = await User.findOne({
        _id: req.userId
      });
      return savedUser;
    },
    editUserPermission: async (_, { id, role, confirmed_by_admin }, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const emailExist = await User.findOne({
        _id: id
      });

      if (!emailExist) {
        throw new Error("User does not exists")
      }

      const user = await User.findOne({
        _id: req.userId
      });

      if (user.role !== 'ADMIN') {
        throw new Error("Not permitted")
      }

      await User.updateOne({
        _id: id
      }, {
        role: role,
        confirmed_by_admin: confirmed_by_admin
      });

      return true;
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
        const user = await User.findOne({
          _id: id
        });

        await User.deleteOne({
          _id: id
        }).then(()=>{
          transporter.sendMail({
            from: '"Smart Garden" <smartfarmpwsz@gmail.com>',
            to: user.email,
            subject: 'Twoje konto zostało usunięte',
            html: removeUserEmailBody(),
          });
        });
        return true;
      } catch {
        return false;
      }
    },
    inviteUser: async (_, { email}, { res, req }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const user = await User.find({
        'email': email
      }).exec();

      if (user.length != 0) {
        throw new AuthenticationError('User exists');
      }

      await jwt.sign({
        email: email
      },
        process.env.EMAIL_SECRET, {
        expiresIn: '1d',
      },
        (err, token) => {
          const url = `http://localhost:3000/invitation?invitation_token=${token}`;

          transporter.sendMail({
            from: '"Smart Garden" <smartfarmpwsz@gmail.com>',
            to: email,
            subject: 'Zaproszenie do systemu',
            html: invitationEmailBody(url),
          });
        },
      );

      return true;
    },
    invitationUserRegister: async (_, { token, name, password }, { res, req }) => {
      try {
        const { email } = jwt.verify(token, process.env.EMAIL_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);
        const totalUsers = await User.find({}).count().exec();

        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          confirmed: true,
          confirmed_by_admin: true,
          role: totalUsers === 0 ? 'ADMIN' : 'VISITOR',
          notifications: false,
          notifications_alerts: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await newUser.save();
        
        return true;
      } catch (e) {
        console.log(e)
        return false;
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
    addManualProfile: async (_, { air_humidity, soil_humidity, air_temperature, light, fertilizer, fertilizer_interval}, { res, req }) => {
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
          fertilizer: fertilizer,
          fertilizer_interval: fertilizer_interval,
          updated_at: new Date().toISOString(),
        }).exec();

        return await ManualProfile.find({}).exec();
      }else{
        const manualProfile = new ManualProfile({
          air_humidity: air_humidity, 
          soil_humidity: soil_humidity, 
          air_temperature: air_temperature, 
          light: light,
          fertilizer: fertilizer,
          fertilizer_interval: fertilizer_interval,
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