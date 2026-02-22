const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    destination: {
        type: String,
        required: true,
    },
    days: {
        type: Number,
        required: true,
        min: 1,
    },
    budget: {
        type: String,
        enum: ["Low", "Medium", "High"],
        required: true,
    },
    travelers: {
        type: String,
        enum: ["Solo", "Couple", "Family", "Friends"],
        required: true,
    },
    destinationImage: {
        type: String,
        default: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
    },
    generatedPlan: {
        type: Schema.Types.Mixed, // Storing the JSON response from Gemini
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Trip", tripSchema);
