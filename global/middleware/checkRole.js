function checkRole(roles) {
 return function (req, res, next) {
  // Assuming you have a way to identify the user's role, such as from req.user.role
  var userRole = req.user.role; // Adjust this line based on how you store the user's role

  // Check if the user's role matches any of the required roles
  if (roles.includes(userRole)) {
   // User has one of the required roles, allow them to proceed
   next();
  } else {
   // User does not have any of the required roles, send an error response
   console.log("role here " + req.user);
   res.status(403).json({ message: "Unauthorized. Insufficient role." });
  }
 };
}

module.exports = checkRole;
