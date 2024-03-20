var mongoose = require("mongoose");

var TicketSchema = new mongoose.Schema(
 {
  name: {
   type: String,
   unique: true,
  },
  title: {
   type: String,
   required: [true, "Ticket Title Required"],
  },
  description: {
   type: String,
   required: false,
  },
  number: {
   type: Number, //ticket number should be automatically created
  },
  ticketType: {
   type: String,
   required: [true, "Ticket Type Required"],
   enum: ["BUG", "FR"],
  },
  status: {
   type: String,
   required: [true, "Ticket Status Required"], //initially status should be to do
  },
  assignedBy: {
   _id: { type: String, required: true },
   firstname: { type: String, required: true },
   lastname: { type: String, required: false },
   email: { type: String, required: true },
   image: { type: String, required: true },
  },
  attachments: [
   {
    type: String,
   },
  ],
  assignees: [
   {
    _id: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: false },
    email: { type: String, required: true },
    image: { type: String, required: true },
   },
  ],
  priority: { type: String, required: true },
  dueDate: { type: Date, required: false },

  reporterClient: { type: String },
  projectDetails: {
   _id: { type: String, required: [true, "Project Id is Required"] },
   name: {
    type: String,
    required: [true, "Project Name is Required"],
   },
   key: {
    type: String,
    required: [true, "Project Key is Required"],
   },
  },
  companyDetails: {
   _id: { type: String, required: [true, "Company Id is Required"] },
   name: {
    type: String,
    required: [true, "Company Name is Required"],
   },
   domain: {
    type: String,
    required: [true, "Domain Name is Required"],
   },
  },
 },
 { timestamps: true }
);

// TicketSchema.pre("save", async function (next) {
//  if (!this.isNew) {
//   return next(); // Do nothing if it's not a new ticket or company ID is not provided
//  }

//  try {
//   var maxTicket = await this.varructor
//    .findOne({ "projectDetails._id": this.projectDetails._id })
//    .sort({ number: -1 })
//    .exec();

//   var newNumber;
//   if (maxTicket) {
//    // Increment the maximum ticket number
//    newNumber = (parseInt(maxTicket.number) + 1).toString();
//   } else {
//    // If no ticket exists yet for the company, start with 1
//    newNumber = 1;
//   }

//   this.name = this.projectDetails.key + "-" + newNumber;
//   this.number = newNumber;
//   next();
//  } catch (error) {
//   next(error);
//  }
// });

TicketSchema.pre("save", function (next) {
 var _this = this;

 if (!_this.isNew) {
  return next();
 }

 _this.constructor
  .findOne({ "projectDetails._id": _this.projectDetails._id })
  .sort({ number: -1 })
  .exec()
  .then(function (maxTicket) {
   var newNumber;

   if (maxTicket) {
    // Increment the maximum ticket number
    newNumber = (parseInt(maxTicket.number, 10) + 1).toString();
   } else {
    // If no ticket exists yet, start with 1
    newNumber = "1";
   }

   _this.name = _this.projectDetails.key + "-" + newNumber;
   _this.number = newNumber;
   next();
  })
  .catch(function (error) {
   next(error);
  });
});

var Ticket = mongoose.model("Ticket", TicketSchema);

module.exports = Ticket;
