const socket = io();

const typing = document.querySelector(".typingStatus");
const messageBox = document.querySelector(".chat");
const userID = messageBox.getAttribute("userID");
var roomID = messageBox.getAttribute("roomID");
var displayName = messageBox.getAttribute("displayName");
var drawer = $(".navbar.fixed-top.off-canvas");
var formattedTime;
var isInGroup = messageBox.getAttribute("isGroup");

var previousScrollHeight = 0;

var el = document.getElementById("inputBox");
var style = window.getComputedStyle(el, null).getPropertyValue("font-size");
var fontSize = parseFloat(style);

/* 
    ----------------------------------------------
                    Define Functions
    ----------------------------------------------
*/

function newCloseDrawer(drawer) {
    if (window.innerWidth < 768) {
        let p = drawer.parent();
        drawer.removeClass("open");
        drawer.attr("data-open-drawer", "0");
        if (p.hasClass("drawer-push") || p.hasClass("drawer-slide"))
            p.removeClass("open");
        $("body").removeClass("drawer-open");
    }
}

function scrollToBottom() {
    messageBox.scrollTop = messageBox.scrollHeight;
}

function changeContact(roomID) {
    $.ajax({
        type: "GET",
        url: "/messagesForChat",
        data: {
            roomID: roomID,
            isGroup: isInGroup,
        },
        dataType: "html",
    }).done(function (html) {
        messageBox.innerHTML = "";
        messageBox.innerHTML += html;
        messageBox.setAttribute("roomID", roomID);
        messageBox.setAttribute("isGroup", isInGroup);
        scrollToBottom();
    });
}

function getMessages(roomID) {
    $.ajax({
        type: "GET",
        url: "/messagesForChat",
        data: {
            roomID: roomID,
            isGroup: isInGroup,
        },
        dataType: "html",
    }).done(function (html) {
        messageBox.innerHTML += html;
        scrollToBottom();
    });
}

function sendMessage() {
    console.log(displayName);
    socket.emit("chat message", {
        message: $("#inputBox").val(),
        userID: userID,
        roomID: roomID,
        isGroup: isInGroup,
        displayName: displayName,
        timestamp: formattedTime,
    });

    socket.emit("stopTyping", "");

    $("#inputBox").val("");
    $("#inputBox").attr("rows", 1);
}

function inviteToGroup(userID, groupID) {
    console.log("client side");
    $.ajax({
        type: "POST",
        url: "/sendInvite",
        data: {
            userID: userID,
            groupID: groupID,
        },
    });
}

function updateTextbox(text) {
    $("#inputBox").val(text);
    //$('#cagetextbox').attr("rows", Math.max.apply(null, text.split("\n").map(function(a){alert(a.length);return a.length;})));
}

function addNewMessage({ user, message, displayName }) {
    const time = new Date();

    formattedTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
    });

    console.log(displayName);

    var receivedMsg, myMsg;
    var senderSpan = ``;
    if (isInGroup == "true") {
        senderSpan = `<span class="small">${displayName}<br></span>`;
    }
    if (messageBox.innerHTML == "") {
        receivedMsg =
            `<p class="yours message" style="margin-top:auto">` +
            senderSpan +
            `${message}</p>`;
        myMsg =
            `<p class="mine message" style="margin-top:auto">` +
            senderSpan +
            `${message}</p>`;
    } else {
        receivedMsg =
            `<p class="yours message">` + senderSpan + `${message}</p>`;
        myMsg = `<p class="mine message">` + senderSpan + `${message}</p>`;
    }

    messageBox.innerHTML += user === userID ? myMsg : receivedMsg;

    scrollToBottom();
}

/* 
    ----------------------------------------------
                Once Document Loads... 
    ----------------------------------------------
*/
$(function () {
    isInGroup = messageBox.getAttribute("isGroup");
    updateTextbox("");

    if (roomID != "none") {
        getMessages(roomID);
        $(".chatRoom[roomID='" + roomID + "']").addClass("active-convo");
        socket.emit("joinRoom", {
            userID: userID,
            roomID: roomID,
            displayName: displayName,
        });
    }

    socket.on("chat message", function (data) {
        console.log(data.displayName);
        addNewMessage({
            user: data.userID,
            message: data.message,
            displayName: data.displayName,
        });
    });

    socket.on("notifyTyping", (data) => {
        if (data.typingID != userID) {
            typing.innerText = data.typingUser + " is typing... ";
        }
    });

    socket.on("notifyStopTyping", (data) => {
        if (data.typingID != userID) {
            typing.innerText = "";
        }
    });

    $(".createGroup").on("click", function () {
        console.log("click");
        $.ajax({
            type: "POST",
            url: "/createNewGroup",
        }).always(function () {
            console.log("here");
            location.reload();
        });
    });

    $(".add-people").on("click", function (event) {
        $("#exampleModalCenter").modal("show");
        event.stopPropagation();
        event.stopImmediatePropagation();
        $.ajax({
            type: "GET",
            url: "/listUsers",
            data: {
                groupID: $(this).attr("groupID"),
            },
        }).done(function (html) {
            $(".append-users").empty();
            $(".append-users").append(html);
            $(".send-invite").on("click", function () {
                inviteToGroup($(this).attr("userID"), $(this).attr("groupID"));
            });
        });
    });

    $(".chatRoom").on("click", function (event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        socket.emit("switchRooms", {
            userID: userID,
            oldRoomID: roomID,
            newRoomID: $(this).attr("roomID"),
            isGroup: $(this).attr("isGroup"),
            displayName: displayName,
        });
        $(".chatRoom[roomID='" + roomID + "']").removeClass("active-convo");
        roomID = $(this).attr("roomID");
        $(".chatRoom[roomID='" + roomID + "']").addClass("active-convo");
        isInGroup = $(this).attr("isGroup");
        changeContact(roomID);
        newCloseDrawer(drawer);
    });

    $("#inputBox").one("focus", function () {
        var savedValue = $(this).val();
        $(this).val("");
        previousScrollHeight = $(this).prop("scrollHeight");
        $(this).val(savedValue);
    });

    $("#inputBox").on("submit", (e) => {
        console.log("submit");
        e.preventDefault();
        if ($(this).val() == "") {
            return;
        }
        sendMessage();
        socket.emit("stopTyping", {
            userID: userID,
            roomID: roomID,
            displayName: displayName,
        });
    });

    $(".submit-btn").on("click", function (e) {
        console.log("button");
        e.preventDefault();
        if ($("#inputBox").val() == "") {
            return;
        }
        sendMessage();
        socket.emit("stopTyping", {
            userID: userID,
            roomID: roomID,
            displayName: displayName,
        });
    });

    $("#inputBox").on("keydown", (e) => {
        if (e.code == "Enter") {
            console.log("wow");
            e.preventDefault();
            if ($("#inputBox").val() == "") {
                return;
            }
            sendMessage();
            socket.emit("stopTyping", {
                userID: userID,
                roomID: roomID,
                displayName: displayName,
            });
        } else {
            if ($(this).prop("scrollHeight") > previousScrollHeight) {
                previousScrollHeight = $(this).prop("scrollHeight");
                var tempRows = $(this).attr("rows");
                $(this).attr("rows", tempRows + 1);
            } else if ($(this).prop("scrollHeight") < previousScrollHeight) {
                previousScrollHeight = $(this).prop("scrollHeight");
                var tempRows = $(this).attr("rows");
                $(this).attr("rows", tempRows - 1);
            }

            socket.emit("typing", {
                userID: userID,
                roomID: roomID,
                displayName: displayName,
            });
        }
    });

    //stop typing
    $("#inputBox").on("blur", () => {
        socket.emit("stopTyping", {
            userID: userID,
            roomID: roomID,
            displayName: displayName,
        });
    });
});
