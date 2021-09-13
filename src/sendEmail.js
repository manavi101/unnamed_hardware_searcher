const nodemailer = require("nodemailer");
require('dotenv').config()

async function sendEmail(to,subject,body){
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
  let mailOptions = {
    from: process.env.EMAIL_USER,
    bcc: to,
    subject: subject,
    html: body
  }
  await transport.sendMail(mailOptions)
}

module.exports = {
  sendEmail
};