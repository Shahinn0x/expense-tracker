const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },

    name: String,

    amount: Number,

    date: Date,

    description: String

}, {
    timestamps: true
});

module.exports = mongoose.model("Expense", expenseSchema);