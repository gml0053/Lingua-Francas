//this pulls in our environment variables
require('dotenv').config()


const express = require('express');
const app = express();
const http = require('http').Server(app);
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
}); // connect to our database

app.get('/', function(req, res) {
    res.send('Hello world!');
});

const server = http.listen(process.env.PORT ||  8080, function() {
    console.log('listening on *:8080');
});