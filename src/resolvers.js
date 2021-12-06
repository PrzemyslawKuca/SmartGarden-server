import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {AuthenticationError} from 'apollo-server-express';
import {User} from "./models/User.js";
import {SensorReading} from "./models/SensorReading.js";
import {Settings} from "./models/Settings.js";
import {createTokens} from "./auth.js";
import nodemailer from 'nodemailer';
import {
  EMAIL_SECRET,
  EMAIL_LOGIN,
  EMAIL_PASSWORD
} from "./constants.js";

export const resolvers = {
  Query: {
    me: (_, __, {
      res,
      req
    }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return User.findOne({
        id: req.userId
      }).exec();
    },
    sensorReads: (_, __,{
      res,
      req
    }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return SensorReading.find({}).exec();
    },
    settings: (_, __,{
      res,
      req
    }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }
      return Settings.find({}).exec();
    },
  },
  Mutation: {
    register: async (_, {
      email,
      password,
      name
    }) => {

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: EMAIL_LOGIN,
          pass: EMAIL_PASSWORD,
        },
      });

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
      return false;
    },
    login: async (_, {
      email,
      password
    }, {
      res
    }) => {
      const user = await User.findOne({
        'email': email
      }).exec();
      if (!user) {
        return null;
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return null;
      }

      if (!user.confirmed) {
        return null;
      }

      const {
        accessToken,
        refreshToken
      } = createTokens(user);

      res.cookie("refresh-token", refreshToken);
      res.cookie("access-token", accessToken);

      return user;
    },
    inputSettings: async (_, {
      mode,
      interval
    }, {
      res,
      req
    }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      const existingSettings = await Settings.find({}).exec();
      console.log(existingSettings)

      if(existingSettings.length > 0){
        throw new Error('Settings already exist')
      }

      const settings = new Settings({
        mode,
        interval,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      await settings.save();

      return settings;
    },
    updateSettings: async (_, {
      mode,
      interval
    }, {
      res,
      req
    }) => {
      if (!req.userId) {
        throw new AuthenticationError('Unauthenticated');
      }

      return Settings.find({}).exec();
    },
  }
};