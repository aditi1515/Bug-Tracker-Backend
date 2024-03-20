var sendEmail = require("./mailer");

function SendWelcomeEmail(name, email, password, companyName, domain, role) {
  var companyNameValue = `<p>Company: ${companyName}</p>`;
  var loginLink = `http://${domain ? domain + "." : ""}localhost:5500/#!/login`;

  var template = `
 <html>
 <head>
     <style>
         body {
             font-family: Arial, sans-serif;
             background-color: #f4f4f4;
             margin: 0;
             padding: 0; 
         }
         .container {
             max-width: 600px;
             margin: 20px auto;
             background-color: #fff;
             padding: 20px;
             border-radius: 5px;
             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
         }
         h1 {
             color: #333;
         }
         p {
             color: #666;
         }
         .button {
             display: inline-block;
             background-color: #007bff;
             color: #fff;
             padding: 10px 20px;
             text-decoration: none;
             border-radius: 5px;
         }
     </style>
 </head>
 <body>
     <div class="container">
         <h1>Welcome to Trackflow, ${name}!</h1>
         <p>Hi there,</p>
         <p>We're excited to have you join Trackflow, your go-to platform for managing your projects efficiently.</p>
         <p>With Trackflow, you can:</p>
         <ul>
             <li>Organize bugs tracking and feature requests</li>
             <li>Collaborate with team members</li>
             <li>Track project progress and quality</li>
         </ul>
         <p>Your login details:</p>
         <p>Email: ${email}</p>
         <p>Password: ${password}</p>
         ${companyName ? companyNameValue : ""}
            <p>Role: ${role}</p>
         <p>Get started by logging in to your account:</p>
         <p>Login : ${loginLink}</p>
         <p>If you have any questions or need assistance, feel free to contact our support team.</p>
         <p>Happy tracking!</p>
         <p>The Trackflow Team</p>
     </div>
 </body> 
 </html>
 `;

  sendEmail(email, "Welcome to Trackflow", template);
}

function sendResetPasswordMail(email, token) {
  var resetPasswordLink = `http://localhost:5500/#!/resetPassword/${token}`;
  var template = `
 <html>
 <head>
     <style>
         body {
             font-family: Arial, sans-serif;
             background-color: #f4f4f4;
             margin: 0;
             padding: 0; 
         }
         .container {
             max-width: 600px;
             margin: 20px auto;
             background-color: #fff;
             padding: 20px;
             border-radius: 5px;
             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
         }
         h1 {
             color: #333;
         }
         p {
             color: #666;
         }
         .button {
             display: inline-block;
             background-color: #007bff;
             color: #fff;
             padding: 10px 20px;
             text-decoration: none;
             border-radius: 5px;
         }
     </style>
 </head>
 <body>
     <div class="container">
         <h1>Welcome to Trackflow!</h1>
         <p>Hi there,</p>
         <p>Reset your password by clicking on the link below</p>
         
         <p>Reset Password : ${resetPasswordLink}</p>
         <p>If you have any questions or need assistance, feel free to contact our support team.</p>
         <p>Happy tracking!</p>
         <p>The Trackflow Team</p>
     </div>
 </body> 
 </html>
 `;
  sendEmail(email, "Reset Trackflow Account Password", template);
}

module.exports = {
  SendWelcomeEmail,
  sendResetPasswordMail,
};
