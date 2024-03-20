var Company = require("../api/company/company.model.js");
var User = require("../api/user/user.model.js");
var { SendWelcomeEmail } = require("../utils/mailTemplates.js");

function superAdminSeed() {
 User.findOne({ role: "SUPER_ADMIN" })
  .then(function (superadmin) {
   if (!superadmin) {
    var superAdminDetails = JSON.parse(process.env.SUPERADMIN_DETAILS);
    console.log(superAdminDetails);
    var superAdminDetails = {
     firstname: superAdminDetails.firstname,
     lastname: superAdminDetails.lastname,
     email: superAdminDetails.email,
     password: superAdminDetails.password,
     phoneNumber: superAdminDetails.phoneNumber,
     companyDetails: {},
     role: "SUPER_ADMIN",
    };
    var superAdmin = new User(superAdminDetails);
    superAdmin
     .save()
     .then(function (user) {
      console.log("Super admin created");
      SendWelcomeEmail(
       user.firstname + " " + user.lastname,
       user.email,
       superAdminDetails.password,
       null,
       null,
       superAdminDetails.role
      );
     })
     .catch(function (err) {
      console.log("Error in super admin seed", err);
     });
   } else {
    console.log("Super admin already exists");
   }
  })
  .catch(function (err) {
   console.log("Error in super admin seed", err);
  });
}

module.exports = superAdminSeed;
