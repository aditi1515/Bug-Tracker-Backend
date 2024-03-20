var mongoose = require("mongoose");

function connectDB() {
 return mongoose
  .connect(process.env.MONGO_URI)
  .then(function () {
   console.log("Connected to MongoDB");
  })
  .catch(function (err) {
   console.log("Error connecting to MongoDB", err);
  });
}

module.exports = connectDB;
