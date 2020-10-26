module.exports = function (app, passport, userHandler) {
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
        res.redirect('/success');
    });

    app.get('/failure', function (req, res) {
        res.render('failure.html');
    });

    app.get('/success', function (req, res) {
        res.render('success.html');
    });

    app.get('/locked', loggedIn, function (req, res) {
        res.send('user is logged in');
    });

    app.get('/list', function (req, res) {
        userHandler.listAllUsers(function (result) {
            res.render('list.html', { allUsers: result });
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
