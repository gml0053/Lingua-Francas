var User = require('../models/user');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        return done(null, user._id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, (err, user) => {
            if (!err) {
                return done(null, user);
            } else {
                return done(err, null);
            }
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy(
            {
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, email, password, done) {
                // asynchronous
                // User.findOne wont fire unless data is sent back
                process.nextTick(function () {
                    // find a user whose email is the same as the forms email
                    // we are checking to see if the user trying to login already exists
                    User.findOne({ email: email }, function (err, user) {
                        // if there are any errors, return the error
                        if (err) return done(err);

                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                        } else {
                            // if there is no user with that email
                            // create the user
                            var newUser = new User();

                            // set the user's local credentials
                            newUser.email = email;
                            newUser.name = req.body.name;
                            newUser.password = newUser.generateHash(password);

                            // save the user
                            newUser.save(function (err) {
                                if (err) throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                });
            }
        )
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy(
            {
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, email, password, done) {
                // callback with email and password from our form

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({ email: email }, function (err, user) {
                    // if there are any errors, return the error before anything else
                    if (err) return done(err);

                    // if no user is found, return the message
                    if (!user) return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                    // if the user is found but the password is wrong
                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                    // all is well, return successful user
                    return done(null, user);
                });
            }
        )
    );

    // Use the GoogleStrategy within Passport.
    //   Strategies in passport require a `verify` function, which accept
    //   credentials (in this case, a token, tokenSecret, and Google profile), and
    //   invoke a callback with a user object.
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/google/callback'
            },
            function (accessToken, refreshToken, profile, done) {
                User.findOne(
                    {
                        googleID: profile.id
                    },
                    function (err, localUser) {
                        if (!localUser) {
                            var newUser = new User();
                            newUser.googleID = profile.id;
                            newUser.displayName = profile.displayName;
                            newUser.givenName = profile.name.givenName;
                            newUser.image = profile.photos[0].value;
                            newUser.email = profile.emails[0].value;

                            newUser.save(function (err) {
                                if (err) throw err;
                                return done(null, newUser); //makes new local user that matches UNT user cred
                            });
                        } else {
                            return done(null, localUser);
                        }
                    }
                );
            }
        )
    );
};
