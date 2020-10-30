var userModel = require('../models/user.js');

module.exports = {
    listAllUsers(callback) {
        userModel.find({}, function (err, result) {
            callback(result);
        });
    },

    addFluency(user, language, callback) {
        userModel.findOne(
            {
                _id: user._id
            },
            async function (err, result) {
                result.fluentIn.push(language);
                await result.save();
                callback();
            }
        );
    }
};
