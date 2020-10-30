const socket = io();

const inputField = document.querySelector('.chatsInput');
const messageForm = document.querySelector('.chatsForm');
const messageBox = document.querySelector('.chat');

const newUserConnected = (user) => {
    userName = messageBox.dataset.userID;
    socket.emit('new user', userName);
    //addToUsersBox(userName);
};

const addNewMessage = ({ user, message }) => {
    const time = new Date();

    const formattedTime = time.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric'
    });

    const receivedMsg = `<p class="yours message">${message}</p>`;

    const myMsg = `<p class="mine message">${message}</p>`;

    messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

newUserConnected();

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    socket.emit('chat message', {
        message: inputField.value,
        nick: userName
    });

    inputField.value = '';
});

inputField.addEventListener('keyup', () => {
    socket.emit('typing', {
        isTyping: inputField.value.length > 0,
        nick: userName
    });
});

socket.on('new user', function (data) {
    //data.map((user) => addToUsersBox(user));
});

socket.on('user disconnected', function (userName) {
    //document.querySelector(`.${userName}-userlist`).remove();
});

socket.on('chat message', function (data) {
    addNewMessage({ user: data.nick, message: data.message });
});
