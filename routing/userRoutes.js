const fs = require('fs');

module.exports = function (app, passport, userHandler) {
    let rawdata = fs.readFileSync('resources/language-codes.json');
    let languages = JSON.parse(rawdata);

    app.get('/login', function (req, res) {
        res.render('signup.html');
    });

    app.get(
        '/google',
        passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/plus.login']
        })
    );

    app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failure' }), function (req, res) {
        res.redirect('/profile');
    });

    app.get('/failure', function (req, res) {
        res.render('failure.html');
    });

    app.get('/success', function (req, res) {
        res.render('success.html');
    });

    app.get('/profile', loggedIn, function (req, res) {
        res.render('editProfile.html', { profile: req.user, languages: languages });
    });

    app.get('/user', loggedIn, function (req, res) {
        var googleID = req.query.googleID;
        userHandler.getProfileFromGoogleID(googleID, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.render('userDetails.html', { profile: result });
            }
        });
    });

    app.get('/discover', loggedIn, function (req, res) {
        userHandler.listAllUsers(function (result) {
            res.render('list.html', { allUsers: result });
        });
    });

    app.get('/chats', loggedIn, function (req, res) {
        userHandler.getAllChats(req.user, function (chatList) {
            if (chatList.length > 0) {
                res.render('chats2.html', { googleID: req.user.googleID, chats: chatList, roomID: chatList[0]._id });
            } else {
                res.render('chats2.html', { googleID: req.user.googleID, chats: chatList, roomID: 'none' });
            }
        });
    });

    app.get(
        '/messagesForChat',
        loggedIn,
        function (req, res) {
            roomID = req.body.roomID || req.query.roomID;
            userHandler.getMessagesForRoom(roomID, function (messages) {
                res.render('innerMessages.html', { messages: messages, myID: req.user.googleID });
            });
        },
        function (err, html) {
            res.send(html);
        }
    );

    app.post('/addFluency', loggedIn, function (req, res) {
        var newLanguage = req.body.addedFluency;
        userHandler.addFluency(req.user, newLanguage, function () {
            res.redirect('back');
        });
    });

    app.post('/removeFluency', loggedIn, function (req, res) {
        var newLanguage = req.body.removedFluency;
        userHandler.removeFluency(req.user, newLanguage, function () {
            res.redirect('back');
        });
    });

    app.post('/addLearning', loggedIn, function (req, res) {
        var newLanguage = req.body.addedLearning;
        userHandler.addLearning(req.user, newLanguage, function () {
            res.redirect('back');
        });
    });

    app.post('/removeLearning', loggedIn, function (req, res) {
        var newLanguage = req.body.removedLearning;
        userHandler.removeLearning(req.user, newLanguage, function () {
            res.redirect('back');
        });
    });

    app.post('/initiate', loggedIn, function (req, res) {
        var targetID = req.body.targetID || req.query.targetID;
        console.log(targetID);
        userHandler.initiateChat(req.user, targetID, function () {
            res.redirect('back');
        });
    });
};

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}
