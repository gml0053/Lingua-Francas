const user = require('../models/user.js');
var userModel = require('../models/user.js');
var directChatModel = require('../models/directChat.js');
var directMessageModel = require('../models/directMessage.js');

module.exports = {
    listAllUsers(callback) {
        userModel.find({}, function (err, result) {
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

    initiateChat(user, inviteeID, callback) {
        console.log(inviteeID);
        userModel.findOne(
            {
                googleID: inviteeID
            },
            function (err, invitee) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(invitee);
                    userModel.findOne(
                        {
                            googleID: user.googleID
                        },
                        function (err, initiator) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(initiator);
                                //if we get here both users were fetched suvvessfully and we can add the new conversation to both
                                //create chat document
                                var newChat = new directChatModel();
                                newChat.initiator = initiator.googleID;
                                newChat.initiatorName = initiator.displayName;
                                newChat.invitee = invitee.googleID;
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
                    var chatIDs = [];
                    result.privateChats.forEach(function (privateChat) {
                        chatIDs.push(privateChat._id);
                    });
                    callback(chatIDs);
                }
            }
        );
    },

    saveMessage(data) {
        /*
        data: {
            message: inputField.value,
            googleID: userName,
            roomID: roomID,
            timestamp: formattedTime
        }*/
        var newMessage = new directMessageModel();
        newMessage.sentBy = data.googleID;
        newMessage.sentAt = data.timestamp;
        newMessage.content = data.message;
        newMessage.save(function (err, result) {
            console.log('save message: ', result);
            directChatModel.findOneAndUpdate(
                {
                    _id: data.roomID
                },
                {
                    $push: {
                        messages: result
                    }
                },
                function (err, resultChat) {
                    console.log(resultChat);
                }
            );
        });
    }
};
