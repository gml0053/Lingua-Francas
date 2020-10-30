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

    app.get('/discover', loggedIn, function (req, res) {
        userHandler.listAllUsers(function (result) {
            res.render('list.html', { allUsers: result });
        });
    });

    app.get('/chats', loggedIn, function (req, res) {
        res.render('chats2.html', { googleID: req.user.googleID });
    });

    app.post('/addFluency', function (req, res) {
        var newLanguage = req.body.addedFluency;
        userHandler.addFluency(req.user, newLanguage, function () {
            res.redirect('back');
        });
    });

    app.post('/removeFluency', function (req, res) {
        var newLanguage = req.body.removedFluency;
        userHandler.removeFluency(req.user, newLanguage, function () {
            res.redirect('back');
        });
    });

    app.post('/addLearning', function (req, res) {
        var newLanguage = req.body.addedLearning;
        userHandler.addLearning(req.user, newLanguage, function () {
            res.redirect('back');
        });
    });

    app.post('/removeLearning', function (req, res) {
        var newLanguage = req.body.removedLearning;
        userHandler.removeLearning(req.user, newLanguage, function () {
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
