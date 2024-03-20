module.exports = function (app) {
 app.use("/api/user", require("./api/user/index.js"));
 app.use("/api/company", require("./api/company/index.js"));
 app.use("/api/project", require("./api/project/index.js"));
 app.use("/api/ticket", require("./api/ticket/index.js"));
};
