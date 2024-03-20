var ProjectUser = require("./../../api/project_user/project_user.model");

function isUserInProject(req, res, next) {
  var userId = req.user._id;
  var projectId = req.query.projectId;

  if (req.user.role == "COMPANY_ADMIN" || req.user.role == "PROJECT_MANAGER") {
    return next();
  }
  if (!projectId) {
    return res
      .status(403)
      .send({ message: "User is not an active member of project" });
  }
  ProjectUser.findOne({ "project._id": projectId, "user._id": userId }).then(
    function (projectUserDoc) {
      if (projectUserDoc.isUserActiveInProject == false) {
        return res
          .status(403)
          .send({ message: "User is not an active member of project" });
      } else {
        next();
      }
    }
  );
}

module.exports = isUserInProject;
