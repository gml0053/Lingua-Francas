//this pulls in our environment variables
require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http").Server(app);
const mongoose = require("mongoose");
var session = require("express-session");
var nunjucks = require("nunjucks");
var passport = require("passport");

var userModel = require("./models/user.js");
var serverModel = require("./models/server.js");
var groupModel = require("./models/group.js");
var privateMessagesModel = require("./models/privateMessages.js");

var userHandler = require("./handlers/userHandler.js");

mongoose.connect(process.env.DB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
}); // connect to our database

require("./handlers/passport.js")(passport); // pass passport for configuration

app.use("/public", express.static(__dirname + "/public"));
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

// required for passport
app.use(
	session({
		secret: "coywghno8c4gcowuhexn9hoigfwnnp39xhnwfg",
		resave: true,
		saveUninitialized: true,
	})
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

nunjucks.configure("app", {
	autoescape: true,
	express: app,
});

require("./routing/basicroutes.js")(app); //include our file with the basic routing definitions
require("./routing/userRoutes.js")(app, userHandler, passport); //include our file with the routes for user modification

const server = http.listen(process.env.PORT || 8080, function () {
	console.log("listening on *:8080");
});
