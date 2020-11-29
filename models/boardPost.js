var mongoose = require("mongoose");

var boardPostSchema = mongoose.Schema({
    posterID: String,
    poserName: String,
    posterImage: String,
    language: String,
    content: String,
    timestamp: String,
});

module.exports = mongoose.model("boardPost", boardPostSchema);
