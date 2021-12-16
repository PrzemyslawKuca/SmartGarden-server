import nodemailer from 'nodemailer';
import {
  EMAIL_LOGIN,
  EMAIL_PASSWORD
} from "../constants.js";

export const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: EMAIL_LOGIN,
        pass: EMAIL_PASSWORD,
    },
});