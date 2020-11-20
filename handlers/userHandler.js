const user = require('../models/user.js');
const fs = require('fs');
var userModel = require('../models/user.js');
var directChatModel = require('../models/directChat.js');
const directChat = require('../models/directChat.js');

let rawdata = fs.readFileSync('resources/language-codes.json');
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
                    _id: user._id
                },
                {
                    $push: {
                        fluentIn: {
                            code: code,
                            English: language
                        }
                    }
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
                _id: user._id
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
                    _id: user._id
                },
                {
                    $push: {
                        learning: {
                            code: code,
                            English: language
                        }
                    }
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
                _id: user._id
            },
            { $pull: { learning: { English: language } } },
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
                                                        initiator.privateChats.push(privateChat._id);
                                                        //add chat to invitee profile
                                                        invitee.privateChats.push(privateChat._id);

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
                                            } else {
                                                callback();
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
                    var chats = [],
                        promises = [];
                    console.log('getting chats for', user.privateChats);

                    result.privateChats.forEach(function (privateChat) {
                        console.log('one chat', privateChat);
                        promises.push(
                            directChatModel.findById(privateChat, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(privateChat);
                                    chats.push(privateChat);
                                }
                            })
                        );
                    });

                    console.log(chats);
                    Promise.all(promises).then(function () {
                        callback(chats);
                    });
                }
            }
        );
    },

    getAcceptedChats(user, callback) {
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
                        if (privateChat.isAccepted) {
                            directChatModel.findById(privateChat, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    chats.push(privateChat);
                                }
                            });
                        }
                    });
                    callback(chats);
                }
            }
        );
    },

    getNewInvitations(user, callback) {
        console.log('getting invitations');
        userModel.findOne(
            {
                _id: user._id
            },
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var chats = [],
                        promises = [];
                    result.privateChats.forEach(function (privateChat) {
                        promises.push(
                            directChatModel.findById(privateChat, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('one chat', result.invitee, 'myid', user._id);
                                    console.log(!privateChat.isAccepted);
                                    console.log(!privateChat.isRejected);
                                    console.log(privateChat.invitee === user._id);
                                    if (
                                        !privateChat.isAccepted &&
                                        !privateChat.isRejected &&
                                        privateChat.invitee == user._id
                                    ) {
                                        console.log('pushing chat');
                                        chats.push(result);
                                    }
                                }
                            })
                        );
                    });

                    Promise.all(promises).then(function () {
                        console.log('Got chats', chats);
                        callback(chats);
                    });
                }
            }
        );
    },

    getPendingInvitations(user, callback) {
        userModel.findOne(
            {
                _id: user._id
            },
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var chats = [],
                        promises = [];
                    result.privateChats.forEach(function (privateChat) {
                        promises.push(
                            directChatModel.findById(privateChat, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('one chat', result);
                                    if (
                                        !privateChat.isAccepted &&
                                        !privateChat.isRejected &&
                                        privateChat.initiator == user._id
                                    ) {
                                        chats.push(result);
                                    }
                                }
                            })
                        );
                    });

                    Promise.all(promises).then(function () {
                        console.log(chats);
                        callback(chats);
                    });
                }
            }
        );
    },

    getRejectedInvitations(user, callback) {
        userModel.findOne(
            {
                _id: user._id
            },
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var chats = [],
                        promises = [];
                    result.privateChats.forEach(function (privateChat) {
                        promises.push(
                            directChatModel.findById(privateChat, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    if (!privateChat.isAccepted && privateChat.isRejected) {
                                        chats.push(result);
                                    }
                                }
                            })
                        );
                    });
                    Promise.all(promises).then(function () {
                        console.log(chats);
                        callback(chats);
                    });
                }
            }
        );
    },

    acceptInvite(user, chatID, callback) {
        userModel.findOne(
            {
                _id: user._id
            },
            function (err, result1) {
                if (err) {
                    console.log(err);
                } else {
                    directChatModel.findOne(
                        {
                            _id: chatID,
                            invitee: user._id
                        },
                        function (err, result2) {
                            if (err) {
                                console.log(err);
                            } else {
                                result2.isAccepted = true;
                                result2.save(function (err, result3) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        callback();
                                    }
                                });
                            }
                        }
                    );
                }
            }
        );
    },

    rejectInvite(user, chatID, callback) {
        userModel.findOne(
            {
                _id: user._id
            },
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    directChatModel.findOne(
                        {
                            _id: chatID,
                            invitee: user._id
                        },
                        function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                result.isRejected = true;
                                result.save(function (err, result) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        callback();
                                    }
                                });
                            }
                        }
                    );
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
