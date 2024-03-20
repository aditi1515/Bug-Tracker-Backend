var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");
var connectDB = require("./db/database.js");
var superAdminSeed = require("./seed/super_admin_seed.js");
var router = require("./routes.js");
var passport = require("./utils/passport.js");

dotenv.config();
var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

connectDB().then(function () {
 superAdminSeed();
});

require("./routes.js")(app);

var port = process.env.PORT || 3000;


app.listen(port, function () {
 console.log(" trackflow listening on port 3000!");
});
