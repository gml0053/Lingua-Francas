const socket = io();

const inputField = document.querySelector('.chatsInput');
const messageForm = document.querySelector('.chatsForm');
const messageBox = document.querySelector('.chat');
const userID = messageBox.getAttribute('userID');
var roomID = messageBox.getAttribute('roomID');
var formattedTime;

$('.chatRoom').on('click', function (event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    socket.emit('switchRooms', {
        userID: userID,
        oldRoomID: roomID,
        newRoomID: $(this).attr('roomID')
    });
    roomID = $(this).attr('roomID');
    changeContact(roomID);
});

function scrollToBottom() {
    console.log('here');
    messageBox.scrollTop = messageBox.scrollHeight;
}

function changeContact(roomID) {
    $.ajax({
        type: 'GET',
        url: '/messagesForChat',
        data: {
            roomID: roomID
        },
        dataType: 'html'
    }).done(function (html) {
        messageBox.innerHTML = '';
        messageBox.innerHTML += html;
        scrollToBottom();
    });
}

function getMessages(roomID) {
    $.ajax({
        type: 'GET',
        url: '/messagesForChat',
        data: {
            roomID: roomID
        },
        dataType: 'html'
    }).done(function (html) {
        messageBox.innerHTML += html;
        scrollToBottom();
    });
}

window.onload = function () {
    if (roomID != 'none') {
        getMessages(roomID);
        socket.emit('joinRoom', {
            userID: userID,
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
    messageBox.innerHTML += user === userID ? myMsg : receivedMsg;
    scrollToBottom();
};

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    socket.emit('chat message', {
        message: inputField.value,
        userID: userID,
        roomID: roomID,
        timestamp: formattedTime
    });

    inputField.value = '';
});

inputField.addEventListener('keyup', () => {
    socket.emit('typing', {
        isTyping: inputField.value.length > 0,
        userID: userID,
        roomID: roomID
    });
});

socket.on('chat message', function (data) {
    addNewMessage({ user: data.userID, message: data.message });
});
