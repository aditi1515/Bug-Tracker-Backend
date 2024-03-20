var router = require("express").Router();
var { upload } = require("../../utils/multer.js");
var passport = require("passport");
var companyController = require("./company.controller.js");
var checkRole = require("../../global/middleware/checkRole.js");

//create company
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  checkRole(["SUPER_ADMIN"]),
  upload.fields([{ name: "logo", maxCount: 1 }]),
  companyController.createCompany
);

//get all companies
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  checkRole(["SUPER_ADMIN"]),
  companyController.getAllCompanies
);

//disable company by id
router.patch(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  checkRole(["SUPER_ADMIN"]),
  upload.fields([{ name: "logo", maxCount: 1 }]),
  companyController.editCompany
);

//get company details by domain
router.get("/getSiteDetails", companyController.getSiteDetails);

module.exports = router;
 