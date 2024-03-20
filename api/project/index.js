var router = require("express").Router();
var passport = require("passport");
var projectController = require("./project.controller.js");
var checkCompany = require("../../global/middleware/checkCompany.js");
var checkRole = require("../../global/middleware/checkRole.js");
var { upload } = require("../../utils/multer.js");
var checkProject = require("../../global/middleware/checkProject.js");

router.post(
 "/",
 passport.authenticate("jwt", { session: false }),
 checkRole(["COMPANY_ADMIN", "PROJECT_MANAGER"]),
 checkCompany,
 upload.fields([{ name: "logo", maxCount: 1 }]),
 projectController.createProject
);


router.get(
 "/all",
 passport.authenticate("jwt", { session: false }),
 checkCompany,
 checkProject,
 projectController.getAllProjects
);


router.get(
 "/:_id",
 passport.authenticate("jwt", { session: false }),
 projectController.getProjectById
);

router.patch(
 "/:_id",
 passport.authenticate("jwt", { session: false }),
 checkRole(["COMPANY_ADMIN", "PROJECT_MANAGER"]),
 checkCompany,
 upload.fields([{ name: "logo", maxCount: 1 }]),
 projectController.editProject
);

module.exports = router;
