var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

var User = require("../models/user.js");

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user);
	});
	passport.deserializeUser(function (obj, done) {
		done(null, obj);
	});

	// Use the GoogleStrategy within Passport.
	//   Strategies in passport require a `verify` function, which accept
	//   credentials (in this case, a token, tokenSecret, and Google profile), and
	//   invoke a callback with a user object.
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: "/google/callback",
			},
			function (accessToken, refreshToken, profile, done) {
				/* User.findOrCreate({ googleId: profile.id }, function (
					err,
					user
				) {
					return done(err, user);
				});*/
				return done();
			}
		)
	);
};
