const mongoose = require("mongoose");
const { required } = require("../schema");
const { types } = require("joi");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    author:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    comment:{
        type: String,
        required: true
    },
    rating:{
        type: Number,
        min: 0,
        max: 5
    },
    created_at:{
        type: Date,
        default: Date()
    }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;