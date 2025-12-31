const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
    },
    buyer: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "usd",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "succeeded", "failed"],
        default: "pending",
    },
    razorpayOrderId: {
        type: String,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        required: false,
    },
    razorpaySignature: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Order", orderSchema);
