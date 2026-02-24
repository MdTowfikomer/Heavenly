const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("./users/signup.ejs");
}

module.exports.signUp = async (req, res, next) => {
    try {
        let newUser = new User({
            username: req.body.username,
            email: req.body.email
        });
        let registeredUser = await User.register(newUser, req.body.password);
        req.login(registeredUser,
            (err) => {
                if (err) return next(err);
                req.flash("success", "User sign up successfully.!");
                res.redirect("/listings");
            });
    } catch (err) {
        req.flash("delete", err.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("./users/login.ejs");
}

module.exports.afterLogin = async (req, res) => {
    req.flash("success", "Welcome to Heavenly! You are logged in..!");
    if (res.locals.redirectUrl) {
        return res.redirect(res.locals.redirectUrl);
    }
    res.redirect("/listings");
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    })
}