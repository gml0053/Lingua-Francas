const fs = require("fs");
var userModel = require("../models/user.js");
var directChatModel = require("../models/directChat.js");
var groupChatModel = require("../models/groupChat.js");
var directChatModel = require("../models/groupChat.js");

let rawdata = fs.readFileSync("resources/language-codes.json");
let languages = JSON.parse(rawdata);
//var directMessageModel = require('../models/directMessage.js');

function getCode(languageName, callback) {
    languages.forEach(function (lang) {
        if (lang.English == languageName) {
            callback(lang.code);
        }
    });
}

module.exports = {
    listAllUsers(callback) {
        userModel.find({}, function (err, result) {
            callback(result);
        });
    },

    listAllUsersExceptMe(userID, callback) {
        userModel.find({ _id: { $ne: userID } }, function (err, result) {
            callback(result);
        });
    },

    addFluency(user, language, callback) {
        getCode(language, function (code) {
            userModel.findOneAndUpdate(
                {
                    _id: user._id,
                },
                {
                    $push: {
                        fluentIn: {
                            code: code,
                            English: language,
                        },
                    },
                },
                { new: false },
                function (err, result) {
                    callback();
                }
            );
        });
    },

    removeFluency(user, language, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id,
            },
            { $pull: { fluentIn: { English: language } } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    },

    addLearning(user, language, callback) {
        getCode(language, function (code) {
            userModel.findOneAndUpdate(
                {
                    _id: user._id,
                },
                {
                    $push: {
                        learning: {
                            code: code,
                            English: language,
                        },
                    },
                },
                { new: true },
                function (err, result) {
                    callback();
                }
            );
        });
    },

    removeLearning(user, language, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id,
            },
            { $pull: { learning: { English: language } } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    },

    updateBio(user, newBio, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id,
            },
            {
                bio: newBio,
            },
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    callback();
                }
            }
        );
    },

    getProfileFromGoogleID(googleID, callback) {
        userModel.findOne(
            {
                googleID: googleID,
            },
            function (err, result) {
                callback(err, result);
            }
        );
    },

    getProfileFromUserID(userID, callback) {
        userModel.findOne(
            {
                _id: userID,
            },
            function (err, result) {
                callback(err, result);
            }
        );
    },

    async inviteToChat(user, inviteeID, callback) {
        var initiator = await userModel.findById(user._id);
        var invitee = await userModel.findById(inviteeID);
        var existingChat = await directChatModel.findOne({
            $or: [
                { initiator: initiator._id, invitee: invitee._id },
                { initiator: invitee._id, invitee: initiator._id },
            ],
        });

        if (!existingChat) {
            var newChat = new directChatModel();
            newChat.initiator = initiator._id;
            newChat.initiatorName = initiator.displayName;
            newChat.invitee = invitee._id;
            newChat.inviteeName = invitee.displayName;
            newChat.isAccepted = false;
            newChat.isRejected = false;
            newChat.startedOn = "";
            newChat.isBlocked = false;
            newChat.blockedBy = "";

            var privateChat = await newChat.save();
            initiator.privateChats.push(privateChat._id);
            invitee.privateChats.push(privateChat._id);
            await initiator.save();
            await invitee.save();
            callback();
        } else {
            callback();
        }
    },

    async createNewGroupChat(user) {
        var initiator = await userModel.findById(user._id);
        var newGroup = new groupChatModel();
        newGroup.initiator = initiator._id;
        newGroup.initiatorName = initiator.displayName;
        var groupChat = await newGroup.save();
        initiator.groupChats.push(groupChat._id);
        await initiator.save();
        callback();
    },

    async inviteOtherToGroup(user, groupID, inviteeID) {
        var initiator = await userModel.findById(user._id);
        var groupChat = await groupChatModel.findById(groupID);
        var invitee = await userModel.findById(inviteeID);
    }

    async getAllChatsWithNames(user, callback) {
        var thisUser = await userModel.findById(user._id);
        var chats = [];
        var newPromise = new Promise(function (resolve, reject) {
            if (thisUser.privateChats.length == 0) {
                resolve();
            } else {
                thisUser.privateChats.forEach(async function (
                    privateChat,
                    index,
                    array
                ) {
                    var result = await directChatModel.findById(privateChat);
                    if (result.invitee == user._id) {
                        var otherUser = await userModel.findById(
                            result.initiator
                        );
                        chats.push({
                            id: privateChat,
                            name: otherUser.displayName,
                            image: otherUser.image,
                        });
                        if (index === array.length - 1) resolve();
                    } else {
                        var otherUser = await userModel.findById(
                            result.invitee
                        );
                        chats.push({
                            id: privateChat,
                            name: otherUser.displayName,
                            image: otherUser.image,
                        });
                        if (index === array.length - 1) resolve();
                    }
                    if (index === array.length - 1) resolve();
                });
            }
        });

        newPromise.then(function () {
            callback(chats);
        });
    },

    async getAcceptedChats(user, callback) {
        var thisUser = await userModel.findById(user._id);
        var chats = [];
        var accepted = await directChatModel.find({
            _id: {
                $in: thisUser.privateChats,
            },
            isAccepted: true,
        });
        if (accepted.length > 0) {
            var grabComponents = new Promise(function (resolve, reject) {
                accepted.forEach(async function (chat, index, array) {
                    if (chat.initiator == thisUser._id) {
                        var otherUser = await userModel.findById(chat.invitee);
                        chats.push({
                            id: chat._id,
                            name: otherUser.displayName,
                            image: otherUser.image,
                        });
                        if (index === array.length - 1) resolve();
                    } else {
                        var otherUser = await userModel.findById(
                            chat.initiator
                        );
                        chats.push({
                            id: chat._id,
                            name: otherUser.displayName,
                            image: otherUser.image,
                        });
                        if (index === array.length - 1) resolve();
                    }
                });
            });

            grabComponents.then(function () {
                callback(chats);
            });
        } else {
            callback(chats);
        }
    },

    async getNewInvitations(user, callback) {
        var thisUser = await userModel.findById(user._id);
        var newInvitations = await directChatModel.find({
            _id: {
                $in: thisUser.privateChats,
            },
            invitee: thisUser._id,
            isAccepted: false,
            isRejected: false,
        });
        return newInvitations;
    },

    async getPendingInvitations(user, callback) {
        var thisUser = await userModel.findById(user._id);
        var pendingInvitations = await directChatModel.find({
            _id: {
                $in: thisUser.privateChats,
            },
            initiator: thisUser._id,
            isAccepted: false,
            isRejected: false,
        });
        return pendingInvitations;
    },

    async getIncomingRejections(user, callback) {
        var thisUser = await userModel.findById(user._id);
        var newInvitations = await directChatModel.find({
            _id: {
                $in: thisUser.privateChats,
            },
            invitee: thisUser._id,
            isAccepted: false,
            isRejected: true,
        });
        return newInvitations;
    },

    async getOutgoingRejections(user, callback) {
        var thisUser = await userModel.findById(user._id);
        var newInvitations = await directChatModel.find({
            _id: {
                $in: thisUser.privateChats,
            },
            initiator: thisUser._id,
            isAccepted: false,
            isRejected: true,
        });
        return newInvitations;
    },

    async acceptInvite(user, chatID, callback) {
        var invitation = await directChatModel.findOne({
            _id: chatID,
            invitee: user._id,
        });
        invitation.isAccepted = true;
        invitation.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback();
            }
        });
    },

    async rejectInvite(user, chatID, callback) {
        var invitation = await directChatModel.findOne({
            _id: chatID,
            invitee: user._id,
        });
        invitation.isAccepted = false;
        invitation.isRejected = true;
        invitation.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback();
            }
        });
    },

    getMessagesForRoom(roomID, callback) {
        directChatModel.findOne(
            {
                _id: roomID,
            },
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var messages = result.messages;
                    callback(messages);
                }
            }
        );
    },

    saveMessage(data) {
        //var newMessage = new directMessageModel();
        //newMessage.sentBy = data._id;
        //newMessage.sentAt = data.timestamp;
        //newMessage.content = data.message;
        directChatModel.findOneAndUpdate(
            {
                _id: data.roomID,
            },
            {
                $push: {
                    messages: {
                        sentBy: data.userID,
                        sentAt: data.timestamp,
                        content: data.message,
                    },
                },
            },
            function (err, resultChat) {}
        );
    },
};
