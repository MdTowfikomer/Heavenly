const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
    },
});

userSchema.plugin(passportLocalMongoose.default); // P-L-M will create the user and passswrd by default

const User = mongoose.model("User", userSchema);

module.exports = User;