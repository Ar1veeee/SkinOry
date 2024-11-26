"use strict";
const nodemailer = require("nodemailer");
const { User } = require("../models/userModel");
const pubsub = require("../config/googleCloud");
const subscriptionDay = "day-routine-deleted-topic-sub";
const subscriptionNight = "night-routine-deleted-topic-sub";
require('dotenv').config();

async function sendEmail(userEmail, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Skinory Service" <${process.env.EMAIL}>`,
    to: userEmail,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
}

async function listenForMessages() {
  const subscription = pubsub.subscription(subscriptionDay, subscriptionNight);

  const messageHandler = async (message) => {
    try {
      const data = JSON.parse(message.data.toString());
      console.log('Received data:', data);
      if (data.action === "deleted_day_routine") {
        const user = await User.findUserById(data.user_id); 
        console.log('User found:', user);
        if (!user) {
          console.error(`User not found: ${data.user_id}`);
          message.nack();
          return;
        }
        
        await sendEmail(
          user.email,
          "Your Day Routine Has Been Deleted",
          "Your Day routine has been successfully deleted from the system."
        );
      }
      if (data.action === "deleted_night_routine") {
        const user = await User.findUserById(data.user_id); 
        console.log('User found:', user);
        if (!user) {
          console.error(`User not found: ${data.user_id}`);
          message.nack();
          return;
        }
        
        await sendEmail(
          user.email,
          "Your Night Routine Has Been Deleted",
          "Your Night routine has been successfully deleted from the system."
        );
      }

      message.ack();
    } catch (error) {
      console.error("Error handling Pub/Sub message:", error);
      message.nack();
    }
  };

  subscription.on("message", messageHandler);
}

module.exports = { listenForMessages };
