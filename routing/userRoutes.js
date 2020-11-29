const fs = require("fs");

module.exports = function (app, passport, userHandler) {
    let rawdata = fs.readFileSync("resources/language-codes.json");
    let languages = JSON.parse(rawdata);

    /*
    =========================================================
    LOG IN OR OUT
    =========================================================
    */
    app.get("/login", function (req, res) {
        res.render("signup.html");
    });

    app.post(
        "/locallogin",
        passport.authenticate("local-login", {
            successRedirect: "/profile", // redirect to the secure profile section
            failureRedirect: "/login", // redirect back to the signup page if there is an error
            failureFlash: true, // allow flash messages
        })
    );

    app.post(
        "/localsignup",
        passport.authenticate("local-signup", {
            successRedirect: "/profile", // redirect to the secure profile section
            failureRedirect: "/login", // redirect back to the signup page if there is an error
            failureFlash: true, // allow flash messages
        })
    );

    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });

    app.get(
        "/google",
        passport.authenticate("google", {
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
        })
    );

    app.get(
        "/google/callback",
        passport.authenticate("google", { failureRedirect: "/failure" }),
        function (req, res) {
            res.redirect("/profile");
        }
    );

    app.get("/failure", function (req, res) {
        res.render("failure.html");
    });

    app.get("/success", function (req, res) {
        res.render("success.html");
    });

    /*
    =========================================================
    FIND OTHER PEOPLE
    =========================================================
    */
    app.get("/user", loggedIn, function (req, res) {
        var userID = req.query.userID;
        userHandler.getProfileFromUserID(userID, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.render("userDetails.html", { profile: result });
            }
        });
    });

    app.get("/discover", loggedIn, function (req, res) {
        userHandler.listAllUsersExceptMe(req.user._id, function (result) {
            res.render("list.html", { allUsers: result });
        });
    });

    app.get(
        "/listUsers",
        loggedIn,
        function (req, res) {
            var groupID = req.body.groupID || req.query.groupID;
            userHandler.listAllUsersExceptMe(req.user._id, function (result) {
                res.render("nameList.html", {
                    allUsers: result,
                    groupID: groupID,
                });
            });
        },
        function (err, html) {
            res.send(html);
        }
    );

    /*
    =========================================================
    EDIT OR UPDATE PROFILE
    =========================================================
    */
    app.get("/profile", loggedIn, async function (req, res) {
        var newInvitations = await userHandler.getNewInvitations(req.user);
        var pendingInvitations = await userHandler.getPendingInvitations(
            req.user
        );
        var incomingRejections = await userHandler.getIncomingRejections(
            req.user
        );
        var outgoingRejections = await userHandler.getOutgoingRejections(
            req.user
        );

        res.render("editProfile.html", {
            profile: req.user,
            languages: languages,
            invitations: newInvitations,
            outgoing: pendingInvitations,
            incomingRejections: incomingRejections,
            outgoingRejections: outgoingRejections,
        });
    });

    app.post("/addFluency", loggedIn, function (req, res) {
        var newLanguage = req.body.addedFluency;
        userHandler.addFluency(req.user, newLanguage, function () {
            res.redirect("back");
        });
    });

    app.post("/removeFluency", loggedIn, function (req, res) {
        var newLanguage = req.body.removedFluency;
        userHandler.removeFluency(req.user, newLanguage, function () {
            res.redirect("back");
        });
    });

    app.post("/addLearning", loggedIn, function (req, res) {
        var newLanguage = req.body.addedLearning;
        userHandler.addLearning(req.user, newLanguage, function () {
            res.redirect("back");
        });
    });

    app.post("/removeLearning", loggedIn, function (req, res) {
        var newLanguage = req.body.removedLearning;
        userHandler.removeLearning(req.user, newLanguage, function () {
            res.redirect("back");
        });
    });

    app.post("/updateBio", loggedIn, function (req, res) {
        var newBio = req.body.newBio;
        userHandler.updateBio(req.user, newBio, function () {
            res.redirect("back");
        });
    });

    /*
    =========================================================
    BOARD POSTS
    =========================================================
    */
    app.post("/createPost", loggedIn, function (req, res) {
        var postLangage = req.body.postLangage || req.query.postLangage;
        var postContent = req.body.postContent || req.query.postContent;
        var timestamp = Date.now();
        var post = {
            langauge: postLangage,
            content: postContent,
            timestamp: timestamp,
        };
        userHandler.createPost(req.user, post, function () {
            res.redirect("back");
        });
    });

    /*
    =========================================================
    CHATS INVITES AND MESSAGE
    =========================================================
    */
    app.get("/chats", loggedIn, function (req, res) {
        userHandler.getAcceptedChats(req.user, function (chatList) {
            userHandler.getAcceptedGroups(req.user, function (groupList) {
                var startRoom = "none";
                var isInGroup = false;
                if (chatList.length > 0) {
                    startRoom = chatList[0].id;
                } else if (groupList.length > 0) {
                    startRoom = groupList[0].id;
                    isInGroup = true;
                }
                res.render("webchat.html", {
                    userID: req.user._id,
                    chats: chatList,
                    groups: groupList,
                    roomID: startRoom,
                    isGroup: isInGroup,
                    displayName: req.user.displayName,
                });
            });
        });
    });

    app.get(
        "/messagesForChat",
        loggedIn,
        function (req, res) {
            roomID = req.body.roomID || req.query.roomID;
            isGroup = req.body.isGroup || req.query.isGroup;
            console.log(isGroup);
            if (isGroup == "true") {
                userHandler.getMessagesForGroup(roomID, function (messages) {
                    res.render("innerGroupMessages.html", {
                        messages: messages,
                        myID: req.user._id,
                    });
                });
            } else {
                userHandler.getMessagesForRoom(roomID, function (messages) {
                    res.render("innerMessages.html", {
                        messages: messages,
                        myID: req.user._id,
                    });
                });
            }
        },
        function (err, html) {
            res.send(html);
        }
    );

    app.post("/createNewGroup", loggedIn, function (req, res) {
        userHandler.createNewGroupChat(req.user, function () {
            res.send("okay");
        });
    });

    app.post("/sendInvite", loggedIn, function (req, res) {
        console.log("inviting");
        userID = req.body.userID || req.query.userID;
        groupID = req.body.groupID || req.query.groupID;
        userHandler.inviteOtherToGroup(req.user, groupID, userID, function () {
            console.log("here");
            //done
        });
    });

    app.post("/initiate", loggedIn, function (req, res) {
        var targetID = req.body.targetID || req.query.targetID;
        userHandler.inviteToChat(req.user, targetID, function () {
            res.json(["done"]);
        });
    });

    app.get("/acceptInvite", loggedIn, function (req, res) {
        var chatID = req.body.chatID || req.query.chatID;
        userHandler.acceptInvite(req.user, chatID, function () {
            res.redirect("back");
        });
    });

    app.get("/rejectInvite", loggedIn, function (req, res) {
        var chatID = req.body.chatID || req.query.chatID;
        userHandler.rejectInvite(req.user, chatID, function () {
            res.redirect("back");
        });
    });

    app.get("/acceptGroupInvite", loggedIn, function (req, res) {
        var chatID = req.body.chatID || req.query.chatID;
        userHandler.acceptGroupInvite(req.user, chatID, function () {
            res.redirect("back");
        });
    });

    app.get("/rejectGroupInvite", loggedIn, function (req, res) {
        var chatID = req.body.chatID || req.query.chatID;
        userHandler.rejectGroupInvite(req.user, chatID, function () {
            res.redirect("back");
        });
    });
};

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/login");
    }
}
