var mongoose = require("mongoose");

// define the schema for our user model
var serverSchema = mongoose.Schema({
	initiator: String,
	invitee: String,
	accepted: Boolean,
	dateCreated: String,
	email: String,
	fluentIn: [String],
	learning: [String],
	dateRegistered: String, //for now; this will be a timestamp later
});

module.exports = mongoose.model("PublicServer", serverSchema); //lets everyone else see this schema with the model name 'ServerSchema'
