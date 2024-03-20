var router = require("express").Router();
var passport = require("passport");
var checkCompany = require("../../global/middleware/checkCompany");
var ticketController = require("./ticket.controller");
var { upload } = require("../../utils/multer");
var checkRole = require("../../global/middleware/checkRole.js");
var checkProject = require("../../global/middleware/checkProject.js");
var onlyProjectMember = require("../../global/middleware/onlyProjectsMember.js");
var ticketEditCheck = require("../../global/middleware/ticketEditCheck.js");
var isUserInProject = require("../../global/middleware/isUserInProject.js")


router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  checkRole(["COMPANY_ADMIN", "PROJECT_MANAGER"]),
  checkCompany,
  upload.fields([{ name: "attachments[]", maxCount: 10 }]),
  ticketController.createTicket
);

router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  checkCompany,
  isUserInProject,
  ticketController.getTickets
);

router.patch(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  checkCompany,
  upload.fields([{ name: "attachments[]", maxCount: 10 }]),
  ticketEditCheck,
  ticketController.editTicket
);

module.exports = router;
