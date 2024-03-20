var passport = require("passport");
var userController = require("./user.controller.js");
var { companyLevelFilter } = require("./middleware.js");
var { checkUserInSystem } = require("./middleware.js");
var { upload } = require("../../utils/multer.js");
var checkCompany = require("../../global/middleware/checkCompany.js");
var checkRole = require("../../global/middleware/checkRole.js");
var router = require("express").Router();

//user login
router.post("/login", companyLevelFilter, userController.login);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  checkCompany,
  checkRole(["COMPANY_ADMIN"]),
  userController.createUser
);


//get user from jwt
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  userController.getUser
);

router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  checkCompany,
  userController.getAllUsers
);

router.get(
  "/allByProjectId",
  passport.authenticate("jwt", { session: false }),
  checkCompany,
  userController.getAllByProjectId
);

router.patch(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  checkCompany,
  checkRole(["COMPANY_ADMIN"]),
  userController.editUser
);

router.post(
  "/forgotPassword",
  checkUserInSystem,
  userController.forgotPassword
);
router.post("/resetPassword/:token", userController.resetPassword);

module.exports = router;
