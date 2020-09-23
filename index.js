//this pulls in our environment variables
require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http").Server(app);
const mongoose = require("mongoose");
var nunjucks = require("nunjucks");

mongoose.connect(process.env.DB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
}); // connect to our database

app.use(express.static("/public"));

nunjucks.configure("views", {
	autoescape: true,
	express: app,
});

require("./routing/basicroutes.js")(app); //include our file with the basic routing definitions

const server = http.listen(process.env.PORT || 8080, function () {
	console.log("listening on *:8080");
});
