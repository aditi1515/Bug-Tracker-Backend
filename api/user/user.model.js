var mongoose = require("mongoose");
var { SendWelcomeEmail } = require("../../utils/mailTemplates");
var bcrypt = require("bcrypt");
require("dotenv").config();
var UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: [true, "First Name is required"] },
    lastname: { type: String, required: false },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    phoneNumber: { type: String, required: [true, "Phone Number is required"] },
    image: {
      type: String,
      required: true,
      default: process.env.DEFAULT_USER_IMAGE,
    },
    isCurrentMember: { type: Boolean, default: true },
    companyDetails: {
      _id: { type: mongoose.Types.ObjectId, required: false },
      domain: { type: String, required: false },
      name: { type: String, required: false },
    },
    role: { type: String, required: true },
    //   permissions: [{ type: String, required: true }],
  },
  { timestamps: true }
);

//hash password
UserSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    bcrypt.hash(user.password, 8, function (err, hashedPassword) {
      if (err) {
        return next(err);
      }
      user.password = hashedPassword;
      next();
    });
  } else {
    next();
  }
});


var User = mongoose.model("User", UserSchema);

module.exports = User;
