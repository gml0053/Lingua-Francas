var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    googleID: String,
    displayName: String,
    givenName: String,
    image: String,
    email: String,
    password: String,
    fluentIn: [
        {
            code: String,
            English: String
        }
    ],
    learning: [
        {
            code: String,
            English: String
        }
    ],
    dateRegistered: String, //for now; this will be a timestamp later
    privateChats: [mongoose.model('directChat').schema] //all the one on one conversatoins
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema); //lets everyone else see this schema with the model name 'User'
