var Ticket = require("../../api/ticket/ticket.model");

function ticketEditCheck(req, res, next) {
 var ticketId = req.params._id;
 var newData = req.body;

 if (req.user.role === "COMPANY_ADMIN" || req.user.role === "PROJECT_MANAGER") {
  next();
 } else {
  Ticket.findById(ticketId).then(function (ticket) {
   var newDueDate = new Date(newData.dueDate);
   if (
    ticket.dueDate.getTime() !== newDueDate.getTime() ||
    ticket.priority !== newData.priority ||
    ticket.title !== newData.title ||
    ticket.ticketType !== newData.ticketType||
    JSON.parse(newData.assignees).length > 0
   ) {
    return res.status(405).send({
     message: "You don't have this edit action permission",
     success: false,
    });
   }
   next();
  });
 }
}

module.exports = ticketEditCheck;
