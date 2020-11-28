var mongoose = require("mongoose");

var groupChatModel = mongoose.Schema({
    initiator: String, //googleID of initiating user
    initiatorName: String,
    invitees: [
        {
            inviteeID: String,
            inviteeName: String,
            isAccepted: Boolean,
            isRejected: Boolean,
        },
    ],
    startedOn: String, //date chat was accepted
    image: String,
    //messages: [mongoose.model('directMessage').schema] //array of all the messages in this chat
    messages: [
        {
            sentBy: String, //googleID of sender
            displayName: String,
            sentAt: String, //timestamp of send
            content: String, //actual message text
        },
    ],
});

module.exports = mongoose.model("groupChat", groupChatModel);
