var mongoose = require("mongoose");

var message = mongoose.Schema({
	sender: String,
	sentAt: String,
	content: String,
});

// define the schema for our user model
var messageList = mongoose.Schema({
	numMessages: Int,
	messages: [message],
});

module.exports = mongoose.model("MessageList", messageList); //lets everyone else see this schema with the model name 'ServerSchema'
