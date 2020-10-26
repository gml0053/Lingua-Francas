const socket = require('socket.io');

module.exports = function (server) {
    const io = socket(server);
    const activeUsers = new Set();

    console.log('h-100');

    io.on('connection', function (socket) {
        console.log('Made socket connection');

        socket.on('new user', function (data) {
            socket.userId = data;
            activeUsers.add(data);
            io.emit('new user', [...activeUsers]);
        });

        socket.on('disconnect', () => {
            activeUsers.delete(socket.userId);
            io.emit('user disconnected', socket.userId);
        });

        socket.on('chat message', function (data) {
            io.emit('chat message', data);
        });

        socket.on('typing', function (data) {
            socket.broadcast.emit('typing', data);
        });
    });
};
