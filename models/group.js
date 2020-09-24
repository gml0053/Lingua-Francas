var mongoose = require("mongoose");

// define the schema for our user model
var groupSchema = mongoose.Schema({
	serverName: String,
	dateCreated: String,
	email: String,
	fluentIn: [String],
	learning: [String],
	dateRegistered: String, //for now; this will be a timestamp later
});

module.exports = mongoose.model("PrivateGroup", groupSchema); //lets everyone else see this schema with the model name 'ServerSchema'
