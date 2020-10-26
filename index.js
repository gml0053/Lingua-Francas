//this pulls in our environment variables
require('dotenv').config();

//yummy yummy dependancies
const express = require('express');
const app = express();
const http = require('http').Server(app);
const mongoose = require('mongoose');
var session = require('express-session');
var nunjucks = require('nunjucks');
var passport = require('passport');

//load our database models
var userModel = require('./models/user.js');
var serverModel = require('./models/server.js');
var groupModel = require('./models/group.js');
var privateMessagesModel = require('./models/privateMessages.js');

//load our code to handle these models
var userHandler = require('./handlers/userHandler.js');
console.log(userHandler);
//connect mongoose to our database URL
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}); // connect to our database

//pull in our passport code and give it our instance of passport
require('./handlers/passport.js')(passport); // pass passport for configuration

//make some useful folders static and accessable
app.use('/public', express.static(__dirname + '/public'));
app.use('/assets', express.static(__dirname + '/frontend/assets'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// required for passport
//this is temporary, later we will put secret in environment file
app.use(
    session({
        secret: 'coywghno8c4gcowuhexn9hoigfwnnp39xhnwfg',
        resave: true,
        saveUninitialized: true
    })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//configuration for nunjucks
nunjucks.configure('frontend', {
    autoescape: true,
    express: app
});

//now pull in the code for what subdirectories our website can serve
require('./routing/basicroutes.js')(app); //give these routes just the server app
require('./routing/userRoutes.js')(app, passport, userHandler); //give these routes access to passport and the userHandler

//fire up the http server
const server = http.listen(process.env.PORT || 8080, function () {
    console.log('listening on *:8080');
});

//now pull in our websocket handler file and give it our server instance
require('./handlers/sockets.js')(server);
