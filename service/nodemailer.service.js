
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

const sendEmail = async (recipient, subject, message) => {
  
try{    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: recipient,
      subject: subject,
      html: message
    });
    console.log(`Email sent to ${recipient}`);}
catch(err){console.log(" email didnt send to "+recipient)}
};

module.exports = sendEmail;