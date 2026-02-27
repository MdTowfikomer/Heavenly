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
        default: "https://media.istockphoto.com/id/1055079680/vector/black-linear-photo-camera-like-no-image-available.jpg?s=612x612&w=0&k=20&c=P1DebpeMIAtXj_ZbVsKVvg-duuL0v9DlrOZUvPG6UJk="
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
