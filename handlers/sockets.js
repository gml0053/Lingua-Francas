const socket = require('socket.io');

module.exports = function (server, userHandler) {
    const io = socket(server);
    const activeUsers = new Set();

    io.on('connection', function (socket) {
        console.log('Made socket connection');

        socket.on('joinRoom', function (data) {
            console.log('here');
            socket.userId = data.googleID;
            socket.join(data.roomID);
            activeUsers.add(data);

            console.log(data.googleID, ' just joined room ', data.roomID);
            io.emit('connect', {
                googleID: [...activeUsers],
                roomID: data.roomID
            });
        });

        socket.on('disconnect', () => {
            activeUsers.delete(socket.userId);
            io.emit('user disconnected', socket.userId);
        });

        socket.on('chat message', function (data) {
            console.log('got messafe');
            /*
            data: {
                message: inputField.value,
                googleID: userName,
                roomID: roomID,
                timestamp: formattedTime
            }*/
            userHandler.saveMessage(data);
            io.to(data.roomID).emit('chat message', data);
        });

        socket.on('typing', function (data) {
            console.log('got typing');
            io.to(data.roomID).emit('typing', data);
        });
    });
};
