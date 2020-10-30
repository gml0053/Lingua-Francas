var userModel = require('../models/user.js');

module.exports = {
    listAllUsers(callback) {
        userModel.find({}, function (err, result) {
            callback(result);
        });
    },

    addFluency(user, language, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id
            },
            { $push: { fluentIn: language } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    }
};
