var mongoose = require("mongoose");

//company schema
var CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company Name Required"],
      immutable: true,
    },

    city: { type: String, required: [true, "Company City Required"] },
    state: { type: String, required: [true, "Company State Required"] },
    country: {
      type: String,
      required: [true, "Company Country Required"],
    },
    isEnabled: { type: Boolean, default: true },
    logo: { type: String, required: [true, "Company Logo Required"] },
    domain: {
      type: String,
      required: [true, "Company Domain Required"],
      unique: true,
      immutable: true,
    },
  },
  { timestamps: true }
);

var Company = mongoose.model("Company", CompanySchema);

module.exports = Company;
