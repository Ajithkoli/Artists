// File: models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    title: String,
    description: String,
    photo: String,
    price: Number,
    isBiddable: { type: Boolean, default: false },
    biddingEndTime: Date,
    tags: [String],
    currentBid: { type: Number, default: 0 },
    bids: [{ user: String, amount: Number, time: Date }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    views: { type: Number, default: 0 },

    // Origin of the product (e.g., Mysuru, Bidar)
    origin: { type: String, required: true },

    // --- ADD THIS FIELD ---
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // This links to your User model
        required: true
    }
});

module.exports = mongoose.model("Product", ProductSchema);