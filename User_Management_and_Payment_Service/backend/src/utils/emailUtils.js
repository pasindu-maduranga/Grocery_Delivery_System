const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //creating transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',                   
    auth: {
      user: process.env.EMAIL_USERNAME, 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  //defining email options
  const mailOptions = {
    from: `"RapidCart" <${process.env.EMAIL_USERNAME}>`,
    to: options.to,
    subject: options.subject,
    text: options.message,              
    html: options.html || options.message,
  };

  //Send email
  await transporter.sendMail(mailOptions);

  console.log(`Email sent to ${options.to}`);
};

module.exports = sendEmail;