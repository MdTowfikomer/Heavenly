const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const tripController = require("../controller/trip.js");

router.get("/new", isLoggedIn, tripController.renderTripForm);

router.post("/", isLoggedIn, wrapAsync(tripController.createTrip));

router.get("/:id", wrapAsync(tripController.showTrip));

module.exports = router;
