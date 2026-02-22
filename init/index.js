const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

// setup the mongo DB connection

// const MONGODB_URL = "mongodb://127.0.0.1:27017/Havenly"; // developement DB url
const MONGODB_URL = process.env.ATLASDB_URL;  // cloude db url

async function main() {
    mongoose.connect(MONGODB_URL);
}

main()
    .then(() => {
        console.log("connected to index.js Successfully");
    })
    .catch((err) => {
        console.log(err);
    });

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data.map((obj) => ({ ...obj, owner: "6989a600e27396cd85a21565" })));
    console.log("Data was initialized");
}

initDB();