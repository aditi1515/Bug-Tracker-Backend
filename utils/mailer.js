var nodemailer = require("nodemailer");

function sendEmail( to, subject , template) {
 try {
  // Configure Nodemailer with the email service provider credentials
  var transporter = nodemailer.createTransport({
   service: process.env.EMAIL_SERVICE,
   host: process.env.EMAIL_HOST,
   auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
   },
  });

  // Create email optionss
  var mailOptions = {
   from: process.env.EMAIL,
   to: to,
   subject: subject,
   html: template,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
   if (error) {
    console.error("Error occurred:", error);
    throw error;
   } else {
    console.log("Email sent:", info.response);
    return info.response;
   }
  });
 } catch (error) {
  console.error("Error occurred:", error);
  throw error;
 }
}

module.exports = sendEmail;
