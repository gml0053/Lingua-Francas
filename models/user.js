var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    googleID: String,
    displayName: String,
    givenName: String,
    image: String,
    email: String,
    fluentIn: [String],
    learning: [String],
    dateRegistered: String, //for now; this will be a timestamp later
    isOnline: Boolean
});

module.exports = mongoose.model('User', userSchema); //lets everyone else see this schema with the model name 'User'
