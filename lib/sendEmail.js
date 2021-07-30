const nodemailer = require("nodemailer");
require('dotenv').config()

function sendEmail(to,subject,body){
  const transport = nodemailer.createTransport({
    host: "smtp.office365.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers:'SSLv3'
    }
  })
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: body
  }
  transport.sendMail(mailOptions, function(error){
    if (error){
        throw error;
    } else {
        return true;
    }
  })
}

module.exports = {
  sendEmail
};