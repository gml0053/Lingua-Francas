const socket = io();

const inputField = document.querySelector('.chatsInput');
const typing = document.querySelector('.typingStatus');
const messageForm = document.querySelector('.chatsForm');
const messageBox = document.querySelector('.chat');
const userID = messageBox.getAttribute('userID');
var roomID = messageBox.getAttribute('roomID');
var drawer = $('.navbar.fixed-top.off-canvas');
var formattedTime;

var previousScrollHeight = 0;

var el = document.getElementById('inputBox');
var style = window.getComputedStyle(el, null).getPropertyValue('font-size');
var fontSize = parseFloat(style);
console.log(fontSize);

function newCloseDrawer(drawer) {
    if (window.innerWidth < 576) {
        let p = drawer.parent();
        drawer.removeClass('open');
        drawer.attr('data-open-drawer', '0');
        if (p.hasClass('drawer-push') || p.hasClass('drawer-slide')) p.removeClass('open');
        $('body').removeClass('drawer-open');
    }
}

$(document)
    .one('focus.textarea', '.autoExpand', function () {
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        previousScrollHeight = this.scrollHeight;
        console.log(this.baseScrollHeight);
        console.log(this.scrollHeight);
        this.value = savedValue;
    })
    .on('input.textarea', '.autoExpand', function () {
        if (this.scrollHeight > previousScrollHeight) {
            previousScrollHeight = this.scrollHeight;
            this.rows = this.rows + 1;
        } else if (this.scrollHeight < previousScrollHeight) {
            previousScrollHeight = this.scrollHeight;
            this.rows = this.rows - 1;
        }
    });

function updateTextbox(text) {
    $('#inputBox').val(text);
    //$('#cagetextbox').attr("rows", Math.max.apply(null, text.split("\n").map(function(a){alert(a.length);return a.length;})));
}

updateTextbox('');

$(function () {
    $('#inputBox').keypress(function (e) {
        if (e.which == 13) {
            sendMessage();
            e.preventDefault();
        }
    });
});

$('.chatRoom').on('click', function (event) {
    console.log('click');
    event.stopPropagation();
    event.stopImmediatePropagation();
    socket.emit('switchRooms', {
        userID: userID,
        oldRoomID: roomID,
        newRoomID: $(this).attr('roomID')
    });
    roomID = $(this).attr('roomID');
    changeContact(roomID);
    newCloseDrawer(drawer);
});

function scrollToBottom() {
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

function sendMessage() {
    socket.emit('chat message', {
        message: inputField.value,
        userID: userID,
        roomID: roomID,
        timestamp: formattedTime
    });

    inputField.value = '';
    $('#inputBox').rows = 1;
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

    var receivedMsg, myMsg;
    if (messageBox.innerHTML == '') {
        receivedMsg = `<p class="yours message" style="margin-top:auto">${message}</p>`;
        myMsg = `<p class="mine message" style="margin-top:auto">${message}</p>`;
    } else {
        receivedMsg = `<p class="yours message">${message}</p>`;
        myMsg = `<p class="mine message">${message}</p>`;
    }
    messageBox.innerHTML += user === userID ? myMsg : receivedMsg;
    scrollToBottom();
};

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    sendMessage();
});

inputField.addEventListener('keypress', () => {
    socket.emit('typing', {
        isTyping: inputField.value.length > 0,
        userID: userID,
        roomID: roomID
    });

    socket.on("notifyTyping", ()  =>  {
        typing.innerText  =  userID  +  " is typing... ";
    });

        //stop typing
    inputField.addEventListener("blur", () =>  {
        socket.emit("stopTyping", "");
        });
        socket.on("notifyStopTyping", () =>  {
        typing.innerText  =  "";});
    });

    socket.on('chat message', function (data) {
        addNewMessage({ user: data.userID, message: data.message });
    });

/* referenced: https://github.com/ezesundayeze/anonymouse-realtime-chat-app/tree/master/public/js

//isTyping event

messageInput.addEventListener("keypress", () =>  {
    socket.emit("typing", { user: "userID", message: "is typing..."  });
    });
    socket.on("notifyTyping", data  =>  {
    typing.innerText  =  data.user  +  "  "  +  data.message;
    console.log(data.user  +  data.message);
    });
    //stop typing
    messageInput.addEventListener("keyup", () =>  {
    socket.emit("stopTyping", "");
    });
    socket.on("notifyStopTyping", () =>  {
    typing.innerText  =  "";
    
    }); */

   






    /*
// Functions to use in chats/group chats, display username, then the chat box
(function() {
$("form").submit(function(e) {
    let  li  =  document.createElement("li");
    e.preventDefault();
  
    messages.appendChild(li).append($("#message").val());
    let  span  =  document.createElement("span");
    socket.emit("chat message", $("#message").val()); 
    messages.appendChild(span).append("by "  +  userID  +  ": "  +  "just now");
    $("#message").val("");
return  false;

});
})();



    // fetching messages from the database
    (function() {
    fetch("/chats")
    .then(data  =>  {
    return  data.json();
    })
    .then(json  =>  {
    json.map(data  =>  {
    let  li  =  document.createElement("li");
    let messages = document.getElementById("messages")
    let  span  =  document.createElement("span");
    messages.appendChild(li).append(data.message);

    messages
        .appendChild(span)
        .append("by "  +  data.sender  +  ": "  +  formatTimeAgo(data.createdAt)); // for most recent message sent when you hover over it
    });
    });
    })();
    
    */ 