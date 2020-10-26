var User = require("../models/user");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

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
        User.findOne(
          {
            googleID: profile.id,
          },
          function (err, localUser) {
            if (!localUser) {
              var newUser = new User();
              console.log(profile.id);
              newUser.googleID = profile.id;
              newUser.displayName = profile.displayName;
              newUser.givenName = profile.name.givenName;
              newUser.image = profile.photos[0].value;

              newUser.save(function (err) {
                if (err) throw err;
                console.log("newUser", newUser);
                return done(null, newUser); //makes new local user that matches UNT user cred
              });
            } else {
              console.log("localUser", localUser);
              return done(null, localUser);
            }
          }
        );
      }
    )
  );
};
