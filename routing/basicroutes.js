module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index.html');
    });

    app.get('/socket', function (req, res) {
        res.render('socket.html');
    });

    app.get('/chat2', function (req, res) {
        res.render('chats2.html');
    });
};
