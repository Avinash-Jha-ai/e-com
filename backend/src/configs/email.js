import nodemailer from "nodemailer";
import { configs } from "./config.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user:configs.EMAIL_USER,
    pass: configs.EMAIL_PASS,
  },
});
