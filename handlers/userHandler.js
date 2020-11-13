const user = require('../models/user.js');
var userModel = require('../models/user.js');
var directChatModel = require('../models/directChat.js');
const directChat = require('../models/directChat.js');
//var directMessageModel = require('../models/directMessage.js');

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
        userModel.findOneAndUpdate(
            {
                _id: user._id
            },
            { $push: { fluentIn: language } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    },

    removeFluency(user, language, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id
            },
            { $pull: { fluentIn: language } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    },

    addLearning(user, language, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id
            },
            { $push: { learning: language } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    },
    removeLearning(user, language, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id
            },
            { $pull: { learning: language } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    },

    getProfileFromGoogleID(googleID, callback) {
        userModel.findOne(
            {
                googleID: googleID
            },
            function (err, result) {
                callback(err, result);
            }
        );
    },

    getProfileFromUserID(userID, callback) {
        userModel.findOne(
            {
                _id: userID
            },
            function (err, result) {
                callback(err, result);
            }
        );
    },

    initiateChat(user, inviteeID, callback) {
        userModel.findOne(
            {
                _id: inviteeID
            },
            function (err, invitee) {
                if (err) {
                    console.log(err);
                } else {
                    userModel.findOne(
                        {
                            _id: user._id
                        },
                        function (err, initiator) {
                            if (err) {
                                console.log(err);
                            } else {
                                //if we get here both users were fetched suvvessfully and we can add the new conversation to both
                                //create chat document
                                directChat.findOne(
                                    {
                                        $or: [
                                            { initiator: initiator._id, invitee: invitee._id },
                                            { initiator: invitee._id, invitee: initiator._id }
                                        ]
                                    },
                                    function (err, result) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            if (!result) {
                                                var newChat = new directChatModel();
                                                newChat.initiator = initiator._id;
                                                newChat.initiatorName = initiator.displayName;
                                                newChat.invitee = invitee._id;
                                                newChat.inviteeName = invitee.displayName;
                                                newChat.isAccepted = false;
                                                newChat.isRejected = false;
                                                newChat.startedOn = '';
                                                newChat.isBlocked = false;
                                                newChat.blockedBy = '';
                                                newChat.save(function (err, privateChat) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        //add chat to invitee profile
                                                        initiator.privateChats.push(privateChat);
                                                        //add chat to invitee profile
                                                        invitee.privateChats.push(privateChat);

                                                        initiator.save(function (err, result) {
                                                            if (err) {
                                                                console.log(err);
                                                            } else {
                                                                invitee.save(function (err, result) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                    } else {
                                                                        //we did all of it hooray
                                                                        callback();
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    },

    getAllChats(user, callback) {
        userModel.findOne(
            {
                _id: user._id
            },
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var chats = [];
                    result.privateChats.forEach(function (privateChat) {
                        chats.push(privateChat);
                    });
                    callback(chats);
                }
            }
        );
    },

    getMessagesForRoom(roomID, callback) {
        directChatModel.findOne(
            {
                _id: roomID
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
                _id: data.roomID
            },
            {
                $push: {
                    messages: {
                        sentBy: data.userID,
                        sentAt: data.timestamp,
                        content: data.message
                    }
                }
            },
            function (err, resultChat) {}
        );
    }
};
