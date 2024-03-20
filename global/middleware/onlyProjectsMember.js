function onlyProjectMember(req, res, next) {
 // this middleware check if user is member of project or not (require project id in req.query.projectId)

 if (req.user.role === "COMPANY_ADMIN" || req.user.role === "SUPER_ADMIN") {
  next();
 } else {
  console.log("req.query.projectId", req.query.projectId);
  console.log("req.projectIds in mid", req.projectIds);
  var isProjectMember = req.projectIds.some((pid) => {
   return pid.toString() === req.query.projectId.toString() ? true : false;
  });

  console.log("isProjectMember", isProjectMember);
  if (isProjectMember) {
   next();
  } else {
   return res.status(403).json({
    message: "User not allowed to access this project",
    success: false,
   });
  }
 }
}

module.exports = onlyProjectMember;
