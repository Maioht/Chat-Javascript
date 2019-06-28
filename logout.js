const express = require("express");
const route = express.Router();

//Basic middleware to prevent user going to /home page if NOT logged in
const redirectIndex = (request, response, next) => {
    if (request.session.userId) {
        next();
    } else {
        response.redirect("/");
    }
}

//Send home.html...
route.get("/", redirectIndex, (request, response) => {
    response.sendFile("logout.html", {
        root: __dirname + "/../public/html"
    });
});

//Destroy cookie and logout...
route.post("/logout", (request, response) => {
    request.session.destroy(err => {
        if (err) return response.redirect("/logout");
        response.clearCookie("cookieName");
        response.redirect("/");
    });
});

module.exports = route;