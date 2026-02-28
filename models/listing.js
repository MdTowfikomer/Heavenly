const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");


const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        url: {
            type: String,
            default: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png",
            set: (v) => v === "" ? "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png" : v,
        },
        filename: {
            type: String,
        },
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: [
            "beach", "mountains", "forest", "city", "desert", "island", "farm", "river", "valley", "canyon", 
            "cave", "waterfall", "glacier", "volcano", "jungle", "swamp", "wetland", "grassland", "savanna", 
            "tundra", "arctic", "antarctic", "ocean", "sea", "bay", "gulf", "strait", "lagoon", "estuary", 
            "delta", "peninsula", "archipelago", "domes", "camping", "reef", "hill", "plateau", "plain", 
            "channel", "fjord", "amazing pools", "boats", "atoll", "castle", "iconic city", "rooms"
        ],
        required: true,
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

// Delete Middleware for Reviews
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});


const Listing = mongoose.model("listing", listingSchema);

// exporting listing model app.js
module.exports = Listing;