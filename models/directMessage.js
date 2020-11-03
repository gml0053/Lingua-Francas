var mongoose = require('mongoose');

var privateChatMessage = mongoose.Schema({
    sentBy: String, //googleID of sender
    sentAt: String, //timestamp of send
    content: String //actual message text
});

module.exports = mongoose.model('directMessage', privateChatMessage);
