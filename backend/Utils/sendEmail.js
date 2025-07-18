const createTransport = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = createTransport.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions, (err, info) => {
    console.log(err);
  });
};

module.exports = sendEmail;
