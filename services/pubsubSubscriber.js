"use strict";
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const pubsub = require("../config/googleCloud");
const Routine = require("../models/routineModel");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const EMAIL_TEMPLATE = `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { inline-size: 100%; max-inline-size: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
        .header { background-color: #ff0303; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; background-color: white; border-radius: 0 0 8px 8px; }
        .product-list { list-style-type: none; padding: 0; }
        .product-list li { padding: 8px; margin-block-end: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #f7f7f7; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-block-start: 20px; }
        .footer a { color: #4CAF50; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Your {{action}} Routine Has Been Deleted</h2>
        </div>
        <div class="content">
          <p>Dear {{username}},</p>
          <p>Your {{action}} routine has been successfully deleted. Below are the details of the routine that was removed:</p>
          <ul class="product-list">{{routineList}}</ul>
          <p>If you need further assistance, feel free to <a href="mailto:aliefarifin99@gmail.com">contact us</a>.</p>
        </div>
        <div class="footer">
          <p>&copy; {{year}} Skinory. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;

async function sendEmail(user, subject, routines, action) {
  const routineListHtml = routines
    .map((routine) => `<li><strong>${routine.product_name}</strong> (${routine.category})</li>`)
    .join("");

  const htmlContent = EMAIL_TEMPLATE.replace("{{action}}", action)
    .replace("{{username}}", user.username || "Valued Customer")
    .replace("{{routineList}}", routineListHtml)
    .replace("{{year}}", new Date().getFullYear());

  const mailOptions = {
    from: `"Skinory Service" <${process.env.EMAIL}>`,
    to: user.email,
    subject: subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}

async function listenForMessages() {
  const subscriptions = [
    pubsub.subscription("day-routine-deleted-topic-sub"),
    pubsub.subscription("night-routine-deleted-topic-sub"),
  ];

  const messageHandler = async (message) => {
    try {
      const data = JSON.parse(message.data.toString());
      console.log("Received data:", data);

      const user = await User.findUserById(data.user_id);
      if (!user) throw new Error(`User not found: ${data.user_id}`);

      let routineDetails = data.routines || [];
      const action = data.action.includes("day") ? "Day" : "Night";

      if (!routineDetails.length) {
        routineDetails = action === "Day" 
          ? await Routine.getDayRoutinesByUserId(data.user_id) 
          : await Routine.getNightRoutinesByUserId(data.user_id);
      }

      if (!routineDetails.length) throw new Error(`No routines found for user: ${data.user_id}`);

      if (action === "Day") await Routine.deleteDayRoutinesByUserId(data.user_id);
      else await Routine.deleteNightRoutinesByUserId(data.user_id);

      await sendEmail(user, `Your ${action} Routine Has Been Deleted`, routineDetails, action);
      message.ack();
    } catch (error) {
      console.error("Error handling Pub/Sub message:", error);
      message.nack();
    }
  };

  subscriptions.forEach((sub) => sub.on("message", messageHandler));
}

module.exports = { listenForMessages };
