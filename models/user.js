var mongoose = require("mongoose");

// define the schema for our user model
var userSchema = mongoose.Schema({
	username: String,
	firstName: String,
	email: String,
	fluentIn: [String],
	learning: [String],
	dateRegistered: String, //for now; this will be a timestamp later
});

module.exports = mongoose.model("User", userSchema); //lets everyone else see this schema with the model name 'User'
