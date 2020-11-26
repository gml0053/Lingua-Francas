var mongoose = require("mongoose");

var groupChatModel = mongoose.Schema({
    initiator: String, //googleID of initiating user
    initiatorName: String,
    invitee: String, //googleID of user invited to chat
    inviteeName: String,
    isAccepted: Boolean, //invitee accepted?
    isRejected: Boolean, //invitee declined?
    startedOn: String, //date chat was accepted
    isBlocked: Boolean, //someone block chat AFTER it was already started?
    blockedBy: String, //who blocked it
    image: String,
    //messages: [mongoose.model('directMessage').schema] //array of all the messages in this chat
    messages: [
        {
            sentBy: String, //googleID of sender
            sentAt: String, //timestamp of send
            content: String, //actual message text
        },
    ],
});

module.exports = mongoose.model("groupChat", groupChatModel);