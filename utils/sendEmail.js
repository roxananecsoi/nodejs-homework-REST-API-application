const sgMail = require('@sendgrid/mail');
require("dotenv").config();

async function sendWithSendGrid(email, token) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const host = process.env.HOSTNAME;
  const verificationLink = `${host}/api/users/verify/${token}`;

  const msg = {
    to: email,
    from: {
      email: process.env.SEND_FROM_EMAIL,
      name: "ContactsApp",
    },
    subject: "Hello from ContactsApp!",
    text: `Hello from ContactsApp\n\nClick the link below to validate your account:\n\n${verificationLink}\n\nOr insert the link in the URL: ${verificationLink}`,
    html: `Hello from <strong>ContactsApp</strong> <br />
      <a href="${verificationLink}">Click here</a> to validate your account. <br />
      Or insert the link in the URL: ${verificationLink}`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${email} from ${msg.from.email}`);
  } catch (error) {
    if (error?.response) {
      console.error(error?.response.body);
    } else {
      console.error(error);
    }
  }
}

module.exports = sendWithSendGrid;