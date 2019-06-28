const mongo = require("mongodb");
const { getDbUrl } = require("./../db.js");
const express = require("express");
const route = express.Router();

const url = getDbUrl();
let database;
mongo.connect(url, { useNewUrlParser: true }, (err, db) => {
    database = db.db(chatDB());
});

//Basic middleware to prevent user going to /chat page if NOT logged in
const redirectIndex = (request, response, next) => {
    if (request.session.userId) {
        next();
    } else {
        response.redirect("/");
    }
}

route.get("/", redirectIndex, (req, resp) => {
    resp.sendFile("chat.html", {
        root: __dirname + "/../public/html"
    });
});

module.exports = route;

function chatDB() {
    return "chatDB";
}