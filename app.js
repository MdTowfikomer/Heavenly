require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ExpressError = require("./utils/expressError.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // I forget what it does
const sessions = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// user model
const User = require("./models/user.js");

// routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const tripRouter = require("./routes/trip.js");

// const MONGODB_URL = "mongodb://127.0.0.1:27017/Havenly";
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}
main()
    .then(() => {
        console.log("Connected Successfully");
    })
    .catch((err) => {
        console.log(err);
    })

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: process.env.SECRET,
    touchAfter: 24 * 3600, // time in seconds
});

const sessionOptions = {
    store,
    secret: process.env.SECRET, // Use process.env.SECRET for production
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //7days,24hours,60mins,60sec,1000minSec
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true // best practice for security
    }
};

// session middlewares
app.use(sessions(sessionOptions));
app.use(flash());

// passport middlewares
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.del = req.flash("delete");
    res.locals.error = req.flash("error");
    res.locals.curUser = req.user;
    console.log("current user:", req.user);
    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// requiring routes
app.get("/demoUser", async (req, res, next) => {
    let fakeUser = new User({
        username: "student",
        email: "student@gmail.com",
    });
    let registerUser = await User.register(fakeUser, "password");
    res.send(registerUser);
});


app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/trips", tripRouter);


app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("./listings/error", { err });
    console.log(message);
});


app.listen(3000, (req, res) => {
    console.log("Server is runnig at port:", 3000);
});
