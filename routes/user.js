const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");

const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const usersController = require("../controller/users.js");

// sign-up
router.route("/signup")
    .get(usersController.renderSignupForm)
    .post(wrapAsync(usersController.signUp)
    );


// login
router.route("/login")
    .get( usersController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: '/login',
            failureFlash: true
        }),
        usersController.afterLogin
    );


// logout
router.get("/logout", usersController.logout)

module.exports = router; 