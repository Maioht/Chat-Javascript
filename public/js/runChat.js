//chat running, Socket example uses also jquery
var socket = io();

function runChat() {

    $('form').submit(function() {
        var msg = $('#m').val();
        var toUser = null;
        if (msg.startsWith('#')) {
            var idx = msg.indexOf(':');
            toUser = msg.substring(1, idx);
            msg = msg.substring(idx + 1);

            var message = toUser + ": " + msg;
            $('#messages').append($('<li>').text(message));
            window.scrollTo(0, document.body.scrollHeight);
        }
        var session = JSON.parse(sessionStorage.getItem('session'));
        socket.emit('chat message', { to: toUser, 'username': session.username, 'message': msg, 'timestamp': new Date() });
        $('#m').val('');
        return false;
    });

    $.get('/rest/session', function(session) {
        sessionStorage.setItem('session', JSON.stringify(session));
        socket.emit('chat user', session.username);
    });

    socket.on('chat message', function(msg) {
        var message = "[ " + msg.timestamp + " ]. " + msg.username + ", #" + msg.chat + ": " + msg.message;
        $('#messages').append($('<li>').text(message));
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('private chat', function(msg) {
        var message = "[ " + msg.timestamp + " ], " + msg.username + ": " + msg.message;
        $('#messages').append($('<li>').text(message));
        window.scrollTo(0, document.body.scrollHeight);
    });


}

socket.on('chat usersList', function(chatUsers) {
    $('#onlineUsers').empty();
    for (idx = 0; idx < chatUsers.length; idx++) {
        var chatUser = chatUsers[idx];
        $('#onlineUsers').append($('<li>').text(chatUser.username));
    };
});



$(document).ready(function() {
    runChat();
});