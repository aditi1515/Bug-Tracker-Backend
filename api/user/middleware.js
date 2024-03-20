var Company = require("../company/company.model.js");
var User = require("../user/user.model.js");

function companyLevelFilter(req, res, next) {
  // get user from req.body.email if null then send 510 error

  var user_email = req.body.email;
  var company_domain = req.headers.x_company_domain;

  if (!user_email) {
    //if email is null
    return res.status(500).json({
      message: "Email is required",
      success: false,
    });
  }

  User.findOne({ email: user_email }).then(function (user) {
    if (!user) {
      //if user is not found
      return res.status(510).json({
        message: "This user does not exist in the system",
        success: false,
      });
    }

    console.log(user);

    if (user.isEnabled === false) {
      //if user is not enabled in the system
      return res.status(510).json({
        message: "User is disabled. Contact Company Admin to enable user.",
        success: false,
      });
    }

    if (!company_domain) {
      //if no company domain , check user role
      console.log("company_domain", company_domain);
      console.log("user", user);
      if (user.role === "SUPER_ADMIN") {
        return next();
      }

      return res.status(403).json({
        message: "User not allowed to access this company",
        success: false,
      });
    } else {
      //if company domain exists and role is superdomain
      if (user.role === "SUPER_ADMIN") {
        return res.status(403).json({
          message: "Super Admin not allowed to access this company ",
          success: false,
        });
      }

      //find company ny domain
      Company.findOne({ domain: company_domain }).then(function (company) {
        if (!company) {
          //if company not found
          return res.status(510).send({
            message: "Company not found",
            success: false,
          });
        }

        if (company.isEnabled === false) {
          //if company is disabled by superadmin
          return res.status(510).send({
            message:
              "Company is disabled. Contact Super Admin to enable company.",
            success: false,
          });
        }

        console.log(company);
        console.log(user.companyDetails._id);
        console.log(company._id);
        //if company is found check whther the user belons to the company or not
        if (!user.companyDetails._id.equals(company._id)) {
          return res.status(510).send({
            message: "User not allowed to access this company",
            success: false,
          });
        }
        next();
      });
    }
  });

  /// get brand id from req header if null then check user is superadmin then pass else send 510 error
  // if brand id is not null then check if brand exists in db then pass else send 510 error
  // if brand exists then check if user is allowed to access this brand then pass else send 510 error
}

function checkUserInSystem(req, res, next) {
  console.log(req.body);
  User.findOne({ email: req.body.email }).then(function (user) {
    if (!user) {
      return res.status(510).json({
        message: "This user does not exist in the system",
        success: false,
      });
    } else {
      next();
    }
  });
}
module.exports = {
  companyLevelFilter,
  checkUserInSystem,
};
