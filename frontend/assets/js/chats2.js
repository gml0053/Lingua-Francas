const socket = io();

const inputField = document.querySelector('.chatsInput');
const messageForm = document.querySelector('.chatsForm');
const messageBox = document.querySelector('.chat');
const googleID = messageBox.getAttribute('userID');
var roomID = messageBox.getAttribute('roomID');
var formattedTime;

function getMessages(roomID) {
    $.ajax({
        type: 'GET',
        url: '/messagesForChat',
        data: {
            roomID: roomID
        },
        dataType: 'html'
    }).done(function (html) {
        //location.reload();
        console.log(html);
        messageBox.innerHTML += html;
    });
}

window.onload = function () {
    console.log('loaded');
    if (roomID != 'none') {
        getMessages(roomID);
        socket.emit('joinRoom', {
            googleID: googleID,
            roomID: roomID
        });
    }
};

const addNewMessage = ({ user, message }) => {
    const time = new Date();

    formattedTime = time.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric'
    });

    const receivedMsg = `<p class="yours message">${message}</p>`;

    const myMsg = `<p class="mine message">${message}</p>`;
    messageBox.innerHTML += user === googleID ? myMsg : receivedMsg;
};

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    socket.emit('chat message', {
        message: inputField.value,
        googleID: googleID,
        roomID: roomID,
        timestamp: formattedTime
    });

    inputField.value = '';
});

inputField.addEventListener('keyup', () => {
    socket.emit('typing', {
        isTyping: inputField.value.length > 0,
        googleID: googleID,
        roomID: roomID
    });
});

socket.on('chat message', function (data) {
    addNewMessage({ user: data.googleID, message: data.message });
});
