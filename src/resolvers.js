import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {AuthenticationError} from 'apollo-server-express';
import {User} from "./models/User.js";
import {SensorReading} from "./models/SensorReading.js";
import {Settings} from "./models/Settings.js";
import {Profiles} from "./models/Profiles.js";
import {createTokens} from "./auth.js";
import {transporter} from './helpers/nodemailer.js';
import {EMAIL_SECRET} from "./constants.js";

export const resolvers = {
  Query: {
    me: (_, __, {res, req}) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return User.findOne({id: req.userId}).exec();
    },
    sensorReads: (_, __,{res, req}) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return SensorReading.find({}).exec();
    },
    settings: (_, __,{res, req}) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return Settings.find({}).exec();
    },
    profiles: (_, __,{res, req}) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return Profiles.find({}).exec();
    },
  },
  Mutation: {
    register: async (_, {email, password, name}) => {
      const user = await User.find({'email': email}).exec();

      if (user.length == 0) {
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
            EMAIL_SECRET, {
              expiresIn: '1d',
            },
            (err, emailToken) => {
              const url = `http://localhost:4000/confirmation/${emailToken}`;

              transporter.sendMail({
                to: email,
                subject: 'Confirm Email',
                html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
              });
            },
          );
        });
        return true;
      }
      throw new Error('Email already in use')
    },
    login: async (_, {email, password}, {res}) => {
      const user = await User.findOne({'email': email}).exec();

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

      const {accessToken,refreshToken} = createTokens(user);

      res.cookie("refresh-token", refreshToken);
      res.cookie("access-token", accessToken);

      return {
        access_token: accessToken,
        refresh_token: refreshToken
      };
    },
    resetPassword: async (_, {email}, {res, req}) =>{
      const user = await User.findOne({'email': email}).exec();

      let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let passwordLength = 12;
      let password = "";

      for (var i = 0; i <= passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber +1);
       }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.updateOne({'_id': user._id}, {
        password: hashedPassword
      });

      transporter.sendMail({
        to: email,
        subject: 'Reset password',
        html: `Your new password: ${password}`,
      });

      return true;
    },
    editUser: async (_, { name, email, password}, { res, req}) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const emailExist = await User.findOne({email: email});
      if(emailExist){
        throw new Error("Email exists")
      }


      await User.updateOne({_id: req.userId}, {
        name: name,
        email: email,
        password: password
      });

      const savedUser = await User.findOne({_id: req.userId});
      return savedUser;
    },
    setupSettings: async (_, {mode, interval}, {res, req}) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const existingSettings = await Settings.find({}).exec();
      if(existingSettings.length > 0){
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
    updateSettings: async (_, {mode, interval, pump, pump_fertilizer, light, fan}, { res, req}) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      await Settings.updateOne({}, {
        mode: mode, 
        interval: interval, 
        pump: pump,
        pump_fertilizer: pump_fertilizer,
        light: light,
        fan: fan,
        updated_at: new Date().toISOString()}).exec();

      const savedSettings = await Settings.findOne({});
      return savedSettings;
    },
    addProfile: async (_, {name, schedule}, { res, req}) => {
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
    editProfile: async (_, {id, name, schedule}, { res, req}) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      await Profiles.updateOne({id: id}, {
        name: name,
        schedule: schedule,
        updated_at: new Date().toISOString(),
      });

      const savedProfile = await Profiles.findOne({id: id});
      return savedProfile;

    }
  }
};