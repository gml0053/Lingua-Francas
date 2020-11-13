const socket = require('socket.io');

module.exports = function (server, userHandler) {
    const io = socket(server);
    const activeUsers = new Set();

    io.on('connection', function (socket) {
        socket.on('joinRoom', function (data) {
            socket.userId = data.userID;
            socket.join(data.roomID);
            activeUsers.add(data);

            console.log(data.userID, ' just joined room ', data.roomID);
            io.emit('connect', {
                googleID: [...activeUsers],
                roomID: data.roomID
            });
        });

        socket.on('switchRooms', function (data) {
            socket.userId = data.userID;
            socket.leave(data.oldRoomID);
            socket.join(data.newRoomID);
            console.log(data.userID, ' just joined room ', data.newRoomID);
        });

        socket.on('disconnect', () => {
            activeUsers.delete(socket.userId);
            io.emit('user disconnected', socket.userId);
        });

        socket.on('chat message', function (data) {
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
            io.to(data.roomID).emit('typing', data);
        });
    });
};
