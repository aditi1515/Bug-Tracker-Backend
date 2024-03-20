var Company = require("./company.model.js");
var userController = require("./../user/user.controller.js");
var { default: mongoose } = require("mongoose");
var User = require("../user/user.model.js");
var {
  generateRandomPassword,
} = require("../../utils/randomPasswordGenerator.js");
var { SendWelcomeEmail } = require("../../utils/mailTemplates.js");
var { deleteImagesFromS3 } = require("../../utils/deleteImagesFromAws.js");

//to create a new company
function createCompany(req, res) {
  mongoose.startSession().then(function (session) {
    session.startTransaction();

    var companyDetails = req.body;
    var companyAdminDetails = req.body.admin;

    //set logo url
    companyDetails.logo = req.files["logo"][0].location;

    var company = new Company(companyDetails);

    company
      .save({ session: session })
      .then(function (company) {
        companyAdminDetails.companyDetails = {};
        (companyAdminDetails.companyDetails._id = company._id),
          (companyAdminDetails.companyDetails.domain = company.domain),
          (companyAdminDetails.companyDetails.name = company.name),
          (companyAdminDetails.role = "COMPANY_ADMIN");
        companyAdminDetails.password = generateRandomPassword();

        var admin = new User(companyAdminDetails);

        //save admin
        return admin.save({ session: session });
      })
      .then(function (savedAdmin) {
        //send mail to saved admin
        SendWelcomeEmail(
          savedAdmin.firstname + " " + savedAdmin.lastname,
          savedAdmin.email,
          companyAdminDetails.password,
          companyDetails.name,
          companyDetails.domain,
          companyAdminDetails.role
        );
        session.commitTransaction().then(function () {
          session.endSession();
          res
            .status(200)
            .send({ message: "Company and admin created successfully" });
        });
      })
      .catch(function (error) {
        console.log("Error creating company or admin", error);
        session.endSession();
        var errorMessage = "Error creating company or admin";
        if (error.code === 11000) {
          var { keyPattern, keyValue } = error;
          console.error("Duplicate key error:", keyPattern, keyValue);
          errorMessage = ` ${Object.keys(keyValue)[0]} : ${
            Object.values(keyValue)[0]
          } already exists.`;
        }

        res.status(500).send({
          message: errorMessage,
          error: error,
        });
      });
  });
}

// // get all compannies
function getAllCompanies(req, res) {
  var pageNo = parseInt(req.query.pageNo) || 1;
  var pageSize = parseInt(req.query.pageSize) || 10;
  var query = req.query.query;

  // Calculate skip value based on page number
  var skipVal = (pageNo - 1) * pageSize;

  // Find total number of documents
  Company.countDocuments({ name: { $regex: query, $options: "i" } })
    .then(function (totalCount) {
      // Find companies for the current page
      Company.find({ name: { $regex: query, $options: "i" } })
        .skip(skipVal)
        .limit(pageSize)
        .then(function (companyDocsArr) {
          // Calculate total pages
          var totalPages = Math.ceil(totalCount / pageSize);

          // Retrieve admin details for each company
          var companyPromises = companyDocsArr.map(function (company) {
            // Assuming each user document has company details and a role field
            return User.findOne({
              "companyDetails._id": company._id,
              role: "COMPANY_ADMIN",
            })
              .then(function (admin) {
                // Attach admin details to company document
                company = company.toObject(); // Convert to plain JavaScript object
                company.admin = admin; // Add admin details
                return company;
              })
              .catch(function (err) {
                console.log("Error getting admin details for company:", err);
                throw err; // Rethrow the error to stop further processing
              });
          });

          // Execute all promises concurrently
          return Promise.all(companyPromises)
            .then(function (companiesWithAdmin) {
              // Sending response with companies, total pages, and current page
              return res.status(200).send({
                message: "Companies have been retrieved",
                companies: companiesWithAdmin,
                totalPages: totalPages,
                currentPage: pageNo,
                pageSize: pageSize,
                query: query,
              });
            })
            .catch(function (err) {
              console.log("Error processing admin details:", err);
              throw err; // Rethrow the error to stop further processing
            });
        });
    })
    .catch(function (err) {
      console.log("Error getting companies", err);
      return res
        .status(500)
        .send({ message: "Error getting companies", err: err });
    });
}

//change companny status
function editCompany(req, res) {
  var company_id = req.params._id;
  var newData = req.body;

  if (req.files["logo"]) {
    deleteImagesFromS3(req.body.previousLogo);
    newData.logo = req.files["logo"][0].location;
  }

  if (newData.members) {
    newData.members = JSON.parse(newData.members);
  }
  if (newData.removedMembers) {
    newData.removedMembers = JSON.parse(newData.removedMembers);
  }

  Company.findByIdAndUpdate(company_id, req.body)
    .then(function (company) {
      return res.status(200).send({ message: "Company updated", company });
    })
    .catch(function (err) {
      return res
        .status(500)
        .send({ message: "Error updating company", err: err });
    });
}

//get company details by domain
function getSiteDetails(req, res) {
  var domain = req.query.domain;
  if (domain === process.env.BASE_DOMAIN) {
    return res.status(200).send({ message: "On base domain" });
  }
  Company.findOne({ domain: domain })
    .then(function (company) {
      if (!company) {
        // This will be true if no company is found
        return res.status(510).send({ message: "Company not found" });
      }
      if (company.isEnabled == false) {
        //if the status of the company is disabled
        return res.status(510).send({ message: "Company is not enabled" });
      }

      //if found return the company
      return res.status(200).json({ company: company, success: true });
    })
    .catch(function (error) {
      console.error("Error fetching company details:", error);
      return res
        .status(510)
        .send({ message: "Error fetching company details" });
    });
}

module.exports = {
  createCompany,
  getAllCompanies,
  editCompany,
  getSiteDetails,
};
