var Company = require("../../api/company/company.model");

function checkCompany(req, res, next) {
 /// prerequisite: req.user should be set
 var company_domain = req.headers.x_company_domain;


 if (!company_domain && req.user.role !== "SUPER_ADMIN") {
  return res.status(510).send({
   message: "Company domain is required",
   success: false,
  });
 }

 console.log("company_domain", company_domain);
 console.log("user", req.user);

 Company.findOne({ domain: company_domain }).then(function (company) {
  if (!company) {//if company not found
   return res.status(510).send({
    message: "Company not found",
    success: false,
   });
  }

  if (!req.user.companyDetails._id.equals(company._id)) {//if user doesnt exist in company
   return res.status(510).send({
    message: "User not allowed to access this company",
    success: false,
   });
  }
  if (company.isEnabled === false) { //if company is disabled
   return res.status(510).send({
    message: "Company is disabled",
    success: false,
   });
  }
  req.company = company; //put company in request
  next();
 });
}

module.exports = checkCompany;
