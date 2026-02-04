const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

// setup the mongo DB connection

const MONGODB_URL = "mongodb://127.0.0.1:27017/Havenly";

async function main() {
    mongoose.connect(MONGODB_URL);
}

main()
.then(()=>{
    console.log("connected to index.js Successfully");
})
.catch((err)=>{
    console.log(err);
});

const initDB = async () =>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data.map((obj) => ({...obj, owner: "697cc89e4144be61b7f2799f"})));
    console.log("Data was initialized");
}

initDB();