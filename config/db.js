const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://username:password@expense.s0kh5a9.mongodb.net/");

        console.log("MongoDB Connected");
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;
