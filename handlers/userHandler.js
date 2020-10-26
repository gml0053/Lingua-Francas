var userModel = require('../models/user.js');

module.exports = {
    listAllUsers(callback) {
        userModel.find({}, function (err, result) {
            callback(result);
        });
    }
};
