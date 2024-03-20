var User = require("./user.model.js");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var { SendWelcomeEmail } = require("../../utils/mailTemplates.js");
var { sendResetPasswordMail } = require("../../utils/mailTemplates.js");
var {
 generateRandomPassword,
} = require("../../utils/randomPasswordGenerator.js");
var ProjectUser = require("../project_user/project_user.model.js");

//login
function login(req, res) {
 var email = req.body.email;
 var password = req.body.password;

 if (!email || !password) { //if email or password is null
  return res.status(400).send({
   message: "Email and password required",
   success: false,
  });
 }

 User.findOne({ email: email })
  .select("+password")
  .then(function (user) {
   console.log("user", user);
   if (!user) { //if user with the email doesnt exists
    return res.status(404).send({
     message: "User not found",
     success: false,
    });
   }
   console.log("user", user);
   bcrypt.compare(password, user.password).then(function (isPasswordValid) { //compare password 
    if (isPasswordValid) {
     var token = jwt.sign(
      {
       id: user._id,
       role: user.role,
       email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: 86400 }
     );
     //remove user's password
     delete user.password;

     return res.status(200).json({ //send token and user
      message: "Login successful",
      token: token,
      user: user,
     });
    }
    return res.status(401).send({
     message: "Invalid password",
     success: false,
    });
   });
  });
}

//create a new user
function createUser(req, res) {
 var userDetails = req.body.user;

 //add fields in user
 userDetails.password = generateRandomPassword();
 userDetails.companyDetails = {};
 userDetails.companyDetails._id = req.company._id;
 userDetails.companyDetails.name = req.company.name;

 var user = new User(userDetails);
 user
  .save()
  .then(function (user) {
   SendWelcomeEmail(
    user.firstname + " " + user.lastname,
    user.email,
    userDetails.password,
    userDetails.companyDetails.name,
    req.company.domain,
    userDetails.role
   );
   return res.status(200).send({ user });
  })
  .catch(function (error) {
   var errorMessage = "Error creating User";
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
}

//get user for authentication
function getUser(req, res) {
 return res.status(200).json({
  user: req.user,
  message: "User authenticated successfully",
 });
}

function getAllUsers(req, res) {
 var pageNo = req.query.pageNo;
 var pageSize = req.query.pageSize;
 var query = req.query.query;
 var onlyEnabled = req.query.onlyEnabled;
 // Calculate skip value based on page number
 var skipVal = pageNo !== undefined ? (pageNo - 1) * pageSize : 0;

 var searchCondition = {};

 if (query !== undefined) {
  searchCondition = { firstname: { $regex: query, $options: "i" } };
 }

 if (onlyEnabled !== undefined) {
  searchCondition.isCurrentMember = true;
 }

 if (req.user.role !== "SUPER_ADMIN") {
  searchCondition["companyDetails._id"] = req.user.companyDetails._id;
 }

 console.log("searchCondition", searchCondition);

 User.countDocuments(searchCondition).then(function (totalCount) {
  var limitVal = pageSize !== undefined ? parseInt(pageSize) : totalCount;
  console.log(pageNo, pageSize, skipVal, limitVal);
  User.find(searchCondition)
   .skip(skipVal)
   .limit(limitVal)
   .then(function (users) {
    console.log("totalCount", totalCount);
    console.log("pageSize", pageSize);

    var totalPages = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
     users,
     message: "Users fetched successfully",
     success: true,
     pageNo: pageNo !== "undefined" ? parseInt(pageNo) : undefined,
     pageSize: pageSize !== "undefined" ? parseInt(pageSize) : undefined,
     totalPages: totalPages,
     query: query,
    });
   })
   .catch(function (err) {
    return res
     .status(500)
     .send({ message: "Error getting users", error: err, success: false });
   });
 });
}

//to get users of a project
function getAllByProjectId(req, res) {
 var projectId = req.query.projectId;

 ProjectUser.find({ "project._id": projectId }).then(function (projectUsers) {
  console.log("projectUsers", projectUsers);
  var users = projectUsers.map((item) => item.user);
  return res.status(200).send({
   users,
   message: "Users fetched successfully",
   success: true,
  });
 });
}

//update user
function editUser(req, res) {
 var userId = req.params._id;
 var newData = req.body;
 User.findByIdAndUpdate(userId, newData)
  .then(function (user) {
   return res.status(200).send({
    user,
    message: "User updated successfully",
    success: true,
   });
  })
  .catch(function (err) {
   return res.status(500).send({
    message: "Error updating user",
    error: err,
    success: false,
   });
  });
}

//forgotPassword link
function forgotPassword(req, res) {
 console.log(req.body);
 if (!req.body.email) {
  return res.status(400).send({
   message: "Email  required",
   success: false,
  });
 } else {
  var token = jwt.sign(
   {
    email: req.body.email,
   },
   process.env.JWT_SECRET,
   { expiresIn: 10000 }
  );
  sendResetPasswordMail(req.body.email, token);
  return res.status(200).send({ message: "Forgot Password Link sent" });
 }
}

function resetPassword(req, res) {
 try {
  var { password } = req.body;
  var { token } = req.params;

  if (!password || !token) {
   return res.status(510).send({ message: "Password reset failed" });
  }
  var payload = jwt.verify(token, process.env.JWT_SECRET);
  console.log("payload", payload);

  User.findOne({ email: payload.email }).then(function (user) {
   if (!user || user.role === "SUPER_ADMIN") {
    return res.status(510).send({ message: "Password reset failed" });
   }
   user.password = password;
   console.log("user passweord change", user);
   user
    .save()
    .then(function (user) {
     return res.status(200).send({ message: "Password reset successful" });
    })
    .catch(function (err) {
     return res
      .status(500)
      .send({ message: "Password reset failed", error: err });
    });
  });
 } catch (error) {
  console.log("error", error);
  return res.status(500).send({ message: "Password reset failed", error });
 }
}
module.exports = {
 login,
 createUser,
 getUser,
 getAllUsers,
 getAllByProjectId,
 editUser,
 forgotPassword,
 resetPassword,
};
