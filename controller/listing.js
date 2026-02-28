const Listing = require("../models/listing");
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const crypto = require("crypto");

module.exports.index = async (req, res) => {
    const { q, category } = req.query;
    let allListing;
    if (q) {
        allListing = await Listing.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } }
            ]
        });
        if (allListing.length === 0) {
            req.flash("error", "No listings found matching your search.");
            return res.redirect("/listings");
        }
    } else if (category) {
        // if category is present, filter listings based on category
        allListing = await Listing.find({ category });
        if (allListing.length === 0) {
            req.flash("error", "No listings found matching your search.");
            return res.redirect("/listings");
        }
    } else {
        allListing = await Listing.find({});
    }
    res.render("./listings/index.ejs", { allListing });
};


module.exports.renderNewForm = async (req, res) => {
    res.render("./listings/new");
}

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing does not exist !");
        return res.redirect("/listings");
    }
    res.render("./listings/show", { listing, geoapifyApiKey: process.env.GEOAPIFY_API_KEY });
}

module.exports.createListing = async (req, res, next) => {
    let url = req.file.secure_url;
    let filename = req.file.public_id;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created !");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    req.flash("success", "Listing updated !");
    res.render("./listings/edit", { listing, originalImageUrl });
}

module.exports.updateLisiting = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Manually update the fields from the form body, ignoring the image field
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    // If a new file is uploaded, update the image object
    if (typeof req.file !== "undefined") {
        listing.image = {
            url: req.file.secure_url,
            filename: req.file.public_id
        };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("delete", "Listing deleted");
    res.redirect("/listings");
}

module.exports.bookListing = async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        const amount = Math.round(listing.price * 100);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: "Invalid listing price" });
        }

        let options = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_${id.substring(0, 5)}_${Date.now()}`,
        };

        razorpay.orders.create(options, (err, order) => {
            if (err) {
                console.error("Razorpay Order Error:", err);
                return res.status(500).json({ error: err.description || "Razorpay order creation failed" });
            }
            res.json(order);
        });
    } catch (err) {
        console.error("Booking Route Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ status: "failure", error: "Missing payment details" });
        }

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");

        if (generated_signature === razorpay_signature) {
            req.flash("success", "Payment successful! Booking confirmed.");
            res.json({ status: "success" });
        } else {
            res.status(400).json({ status: "failure", error: "Invalid payment signature" });
        }
    } catch (err) {
        console.error("Verification Route Error:", err);
        res.status(500).json({ status: "failure", error: "Internal Server Error" });
    }
}