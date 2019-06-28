const { getDbUrl } = require("./db");
const express = require("express");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo")(expressSession);
const _ = require('lodash');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = 3000;
const url = getDbUrl();



/** basic midware */
app.use("/", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(expressSession({
    name: "cookieName",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    secret: "aSecret",
    cookie: {
        //maxAge: 1000*60,
        sameSite: true,
        secure: false
    },
    store: new MongoStore({ url: url })
}));

//Chat io socket connection
io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        if (msg.to != null) {
            var chatUser = _.find(chatUsers, function(chatUser) {
                return chatUser.username === msg.to;
            });
            if (chatUser != null) {
                var message = { timestamp: getCurrentDate(), username: msg.username, message: msg.message };
                io.to(chatUser.socketId).emit('private chat', message);
                return;
            }
        }
        var messageToAll = { chat: 'say to all', timestamp: getCurrentDate(), username: msg.username, message: msg.message };
        io.emit('chat message', messageToAll);
    });
});

//CHAT event listener - counter
var numUsers = 0;
var chatUsers = [];
io.on('connection', (socket) => {
    ++numUsers
    socket.emit('numUsers', numUsers);
    console.log('user connected, users:', numUsers);
    socket.on('disconnect', () => {
        --numUsers;
        console.log('Disconnected: left: ', numUsers);
        _.remove(chatUsers, function(chatUser) {
            return chatUser.socketId == socket.id;
        });
        console.log(chatUsers);

        socket.emit('chat usersList', chatUsers);
    });

    socket.on('chat user', (msg) => {
        var chatUser = { username: msg, socketId: socket.id };
        chatUsers.push(chatUser);
        console.log(chatUsers);
        //set intervall update to userlist 
        setInterval(() => {
            socket.emit('chat usersList', chatUsers);
        }, 3000);
    });
});

//add chat timestamp, could use moment.js library
function getCurrentDate() {
    var currentDate = new Date();
    var day = (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate();
    var month = ((currentDate.getMonth() + 1) < 10 ? '0' : '') + (currentDate.getMonth() + 1);
    var year = currentDate.getFullYear();
    var hour = (currentDate.getHours() < 10 ? '0' : '') + currentDate.getHours();
    var minute = (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes();
    var second = (currentDate.getSeconds() < 10 ? '0' : '') + currentDate.getSeconds();
    return day + "." + month + "." + year + " " + hour + ":" + minute + ":" + second;

}
/**
 * Define routes
 */
app.use("/", require("./routes/index.js"));
app.use("/logout", require("./routes/logout.js"));
app.use("/chat", require("./routes/chat.js"));
app.use("/rest/session", (req, res) => { // fetch user's username from http session via http request
    return res.send({ 'username': req.session.username });
});

http.listen(PORT, () => {
    console.log("Listening to port " + PORT);
});