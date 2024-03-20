var { default: mongoose } = require("mongoose");
var Ticket = require("./ticket.model");
var User = require("../user/user.model");
var { deleteImagesFromS3 } = require("../../utils/deleteImagesFromAws");

function createTicket(req, res) {
 var ticketDetails = req.body;
 ticketDetails.createdBy = req.user._id;
 ticketDetails.companyDetails = {};
 ticketDetails.companyDetails._id = req.company._id;
 ticketDetails.companyDetails.name = req.company.name;
 ticketDetails.companyDetails.domain = req.company.domain;
 ticketDetails.assignedBy = {
  _id: req.user._id,
  firstname: req.user.firstname,
  lastname: req.user.lastname,
  email: req.user.email,
  image: req.user.image,
 };

 ticketDetails.projectDetails = JSON.parse(ticketDetails.projectDetails);
 if (ticketDetails.assignees) {
  ticketDetails.assignees = JSON.parse(ticketDetails.assignees);
 }
 console.log("req.files", req.files);
 if (req.files["attachments[]"]) {
  ticketDetails.attachments = req.files["attachments[]"].map(function (img) {
   return img.location;
  });
 }
 console.log("ticketDetails", ticketDetails);
 var newTicket = new Ticket(ticketDetails);
 newTicket
  .save()
  .then(function (ticket) {
   return res
    .status(200)
    .send({ message: "Ticket created successfully", ticket: ticket });
  })
  .catch(function (error) {
   console.error("Error creating ticket", error);
   if (error.code === 11000) {
    var { keyPattern, keyValue } = error;
    errorMessage = ` ${Object.keys(keyValue)[0]} : ${
     Object.values(keyValue)[0]
    } already exists.`;
   }
   return res
    .status(500)
    .send({ message: "Error creating ticket", error: error });
  });
}

//get all tickets
function getTickets(req, res) {
 var project_id = req.query.projectId;

 console.log("project_id", project_id);
 var searchCondition = {
  "companyDetails._id": req.company._id,
  "projectDetails._id": project_id,
 };

 console.log("searchConditionhere", searchCondition);

 var pageNo = req.query.pageNo;
 var pageSize = req.query.pageSize;
 var name = req.query.name;
 var description = req.query.description;
 var status = req.query.status;
 var ticketType = req.query.ticketType;
 var priority = req.query.priority;

 var skipVal = pageNo !== undefined ? (pageNo - 1) * pageSize : 0;

 if (name !== undefined && description !== undefined) {
  searchCondition.$or = [
   { name: { $regex: name, $options: "i" } },
   { description: { $regex: description, $options: "i" } },
  ];
 }

 if (status !== undefined) {
  searchCondition.status = status;
 }

 if (ticketType !== undefined) {
  searchCondition.ticketType = ticketType;
 }

 if (priority !== undefined) {
  searchCondition.priority = priority;
 }

 console.log("searchCondition", searchCondition);

 Ticket.countDocuments(searchCondition)
  .then(function (totalCount) {
   var limitVal = pageSize !== undefined ? parseInt(pageSize) : totalCount;
   Ticket.find(searchCondition)
    .skip(skipVal)
    .limit(limitVal)
    .then(function (tickets) {
     var totalPages = Math.ceil(totalCount / pageSize);
     console.log("tickets", tickets);

     return res.status(200).send({
      message: "Tickets fetched successfully",
      tickets: tickets,
      success: true,
      pageNo: parseInt(pageNo),
      pageSize: parseInt(pageSize),
      totalPages: totalPages,
     });
    });
  })
  .catch(function (error) {
   return res
    .status(500)
    .send({ message: "Error getting tickets", error: error });
  });
}

//edit ticket
function editTicket(req, res) {
 var ticketId = req.params._id;
 var ticketDetails = req.body;

 ticketDetails.companyDetails = {};
 ticketDetails.companyDetails._id = req.company._id;
 ticketDetails.companyDetails.name = req.company.name;

 console.log("ticketDetails", ticketDetails);

 ticketDetails.attachments = JSON.parse(ticketDetails.previousAttachments);
 ticketDetails.projectDetails = JSON.parse(ticketDetails.projectDetails);

 if (ticketDetails.assignees) {
  console.log("ticketDetails.assignees new ", ticketDetails.assignees);
  ticketDetails.assignees = JSON.parse(ticketDetails.assignees);
 }

 if (ticketDetails.alreadyAssigned) {
  ticketDetails.assignees = ticketDetails.assignees.concat(
   JSON.parse(ticketDetails.alreadyAssigned)
  );
 }

 if (req.files["attachments[]"]) {
  var newattachments = req.files["attachments[]"].map(function (img) {
   return img.location;
  });

  ticketDetails.attachments = ticketDetails.attachments.concat(newattachments);
 }

 if (ticketDetails.removedAttachments && ticketDetails.attachments.length > 0) {
  deleteImagesFromS3(JSON.parse(ticketDetails.removedAttachments));
 }

 console.log(
  "ticketDetails attachments length",
  ticketDetails.attachments.length
 );

 console.log("ticketDetails before save", ticketDetails);

 Ticket.findByIdAndUpdate(ticketId, ticketDetails)
  .then(function (ticket) {
   console.log("new ticket", ticket);
   return res
    .status(200)
    .send({ message: "Ticket updated successfully", ticket: ticket });
  })
  .catch(function (error) {
   return res
    .status(500)
    .send({ message: "Error updating ticket", error: error });
  });
}

module.exports = {
 createTicket,
 getTickets,
 editTicket,
};
