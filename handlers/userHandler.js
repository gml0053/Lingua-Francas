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
    },

    removeFluency(user, language, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id
            },
            { $pull: { fluentIn: language } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    },

    addLearning(user, language, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id
            },
            { $push: { learning: language } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    },
    removeLearning(user, language, callback) {
        userModel.findOneAndUpdate(
            {
                _id: user._id
            },
            { $pull: { learning: language } },
            { new: false },
            function (err, result) {
                callback();
            }
        );
    }
};
