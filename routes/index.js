const bcrypt = require("bcrypt");
const mongo = require("mongodb");
const { getDbUrl } = require("./../db.js");
const express = require("express");
const route = express.Router();

//Connect to DB and save the database handler object to "database"
const URL = getDbUrl();
let database;
mongo.connect(URL, { useNewUrlParser: true }, (err, db) => {
    database = db.db("chatDB");
});

//Just send index.html to the user...
route.get("/", (request, response) => {
    response.sendFile("index.html", {
        root: __dirname + "/../public/html"
    });
});

//User wants to register
route.post("/register", (request, response) => {
    const { username, password, email } = request.body;
    //Make sure the user or email does NOT already exist
    //And if not, save the user (encrypting the pw as well)
    database.collection("users").findOne({ $or: [{ username: username }, { email: email }] }, (err, user) => {
        if (user) {
            response.redirect("/?error=username");
        } else {
            bcrypt.hash(password, 12, (err, pwd) => {
                if (err) throw err;
                database.collection("users").insertOne({
                    username: username,
                    email: email,
                    password: pwd,
                });
                response.redirect("/");
            });
        }
    });
});

//Handle login
route.post("/login", (request, response) => {
    const { username, password } = request.body;
    //Find user from DB and then compare encrypted passwords
    //also store user id and name to request.session object
    database.collection("users").findOne({ username: username }, (err, user) => {
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    request.session.userId = user._id;
                    request.session.username = user.username;
                    response.redirect("/chat");
                } else {
                    response.redirect("/");
                }
            });
        } else {
            response.redirect("/");
        }
    });
});


module.exports = route;