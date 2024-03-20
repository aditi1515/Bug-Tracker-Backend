var ProjectUser = require("../../api/project_user/project_user.model");

function checkProject(req, res, next) {
 // if user is SUPER_ADMIN or COMPANY_ADMIN, then no need to check project
 console.log("req.user.role: ", req.user.role);

 if (req.user.role === "SUPER_ADMIN" || req.user.role === "COMPANY_ADMIN") {
  return next();
//get projects accroeding to user id
 } else {
  ProjectUser.find({
   "user._id": req.user._id, 
   isUserActiveInProject: true,
  }).then(function (projectUsers) {
   console.log("projectUsers: ", projectUsers);
   var projectIds = projectUsers.map((item) => item.project._id);
   req.projectIds = projectIds;
   console.log("req.projectIds: for  ", req.projectIds);
   return next();
  });
 }
}
module.exports = checkProject;
