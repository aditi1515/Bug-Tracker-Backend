var mongoose = require("mongoose");

var ProjectUserSchema = new mongoose.Schema(
 {
  project: {
   _id: {
    type: mongoose.Types.ObjectId,
    required: [true, "Project Id is required"],
   },
   key: {
    type: String,
    required: [true, "Project Key is required"],
   },
   name: {
    type: String,
    required: [true, "Project Name is required"],
   },
  },
  user: {
   _id: {
    type: mongoose.Types.ObjectId,
    required: [true, "User Id is required"],
   },
   firstname: { type: String, required: [true, "User First Name is required"] },
   lastname: { type: String },
   email: { type: String, required: [true, "User Email is required"] },
   image: { type: String, required: true },
  },
  isUserActiveInProject: { type: Boolean, default: true },
 },
 { timestamps: true }
);

var ProjectUser = mongoose.model("ProjectUser", ProjectUserSchema);

module.exports = ProjectUser;
