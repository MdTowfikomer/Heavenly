const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const { q } = req.query;
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
    res.render("./listings/edit", { listing , originalImageUrl});
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