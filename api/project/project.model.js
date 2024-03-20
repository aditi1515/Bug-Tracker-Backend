var mongoose = require("mongoose");

var ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project Name Required"],
    },
    description: {
      type: String,
      required: false,
    },
    key: {
      type: String,
      required: [true, "Project Key Required"],
      unique: true,
      immutable:true
    },
    inProgress: {
      type: Boolean,
      required: [true, "Project Status Required"],
      default: true,
    },
    createdBy: {
      _id: {
        type: mongoose.Types.ObjectId,
        required: [true, "Created By field is required"],
      },
      firstname: { type: String, required: [true, "Created By User First Name Required"] },
      lastname: { type: String},
      email: { type: String, required: [true, "Created By Email Required"] },
    },
    logo: {
      type: String,
      required: true,
    },
    dueDate: { type: Date, required: false },
    companyDetails: {
      _id: { type: String, required: [true, "Company Id is Required"] },
      name: { type: String, required: [true, "Company Name is Required"] },
      domain: {
        type: String,
        required: [true, "Company Domain is Required"],
      },
    },
  },
  { timestamps: true }
);

var Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
