const Razorpay = require("razorpay");
const crypto = require("crypto");
const Product = require("../models/Product");
const Order = require("../models/Order");
const ErrorHandler = require("../utils/errorHandler");

// Initialize Razorpay
// Note: instance will be created inside functions or globally if keys are guaranteed
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay keys not configured");
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// Send Razorpay Key ID to frontend
exports.sendRazorpayKey = async (req, res, next) => {
    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID
    });
};

// Process Payment (Create Razorpay Order)
exports.processPayment = async (req, res, next) => {
    try {
        console.log("Processing Request Body:", req.body);
        const { productId } = req.body;

        if (!productId) {
            return next(new ErrorHandler("Product ID is required", 400));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        const instance = getRazorpayInstance();

        // Amount in paise (multiply by 100)
        const options = {
            amount: Math.round(product.price * 100),
            currency: "INR", // Changed to INR for Razorpay standard usage inside India
            receipt: `order_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            product // Return product details for frontend checkout
        });

    } catch (error) {
        if (error.message === "Razorpay keys not configured") {
            return next(new ErrorHandler("Payment system not configured correctly (Missing Keys).", 500));
        }
        next(error);
    }
};

// Process Cart Payment (Create Razorpay Order for multiple items)
exports.processCartPayment = async (req, res, next) => {
    try {
        const { items } = req.body; // Array of { _id, price, ... }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new ErrorHandler("Cart is empty", 400));
        }

        const totalAmount = items.reduce((acc, item) => acc + (item.price || 0), 0);

        if (totalAmount <= 0) {
            return next(new ErrorHandler("Invalid total amount", 400));
        }

        const instance = getRazorpayInstance();

        const options = {
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: `cart_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        next(error);
    }
};

// Create Order (Verify Payment and Save)
exports.createOrder = async (req, res, next) => {
    try {
        const {
            productId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;

        // Verify Signature
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpaySignature;

        if (isAuthentic) {
            const product = await Product.findById(productId);

            const order = await Order.create({
                product: productId,
                buyer: req.user.id,
                seller: product.user,
                amount: product.price,
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: razorpayPaymentId,
                razorpaySignature: razorpaySignature,
                paymentStatus: "succeeded",
                currency: "INR"
            });

            res.status(201).json({
                success: true,
                order
            });
        } else {
            return next(new ErrorHandler("Payment verification failed", 400));
        }

    } catch (error) {
        next(error);
    }
};

// Verify Cart Payment and Create Multiple Orders
exports.verifyCartPayment = async (req, res, next) => {
    try {
        const {
            items,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;

        // Verify Signature
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpaySignature;

        if (!isAuthentic) {
            return next(new ErrorHandler("Payment verification failed", 400));
        }

        // Logic to create multiple orders
        const ordersCreated = [];
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (product) {
                const order = await Order.create({
                    product: product._id,
                    buyer: req.user.id,
                    seller: product.user,
                    amount: product.price,
                    razorpayOrderId: razorpayOrderId,
                    razorpayPaymentId: razorpayPaymentId,
                    razorpaySignature: razorpaySignature,
                    paymentStatus: "succeeded",
                    currency: "INR"
                });
                ordersCreated.push(order);
            }
        }

        res.status(201).json({
            success: true,
            orders: ordersCreated
        });

    } catch (error) {
        next(error);
    }
};

// Get My Order Stats (Counts for Profile)
exports.getMyOrderStats = async (req, res, next) => {
    try {
        const buyerCount = await Order.countDocuments({ buyer: req.user.id });
        const sellerCount = await Order.countDocuments({ seller: req.user.id });

        res.status(200).json({
            success: true,
            buyerCount,
            sellerCount
        });
    } catch (error) {
        next(error);
    }
};

// Get My Artworks (Artworks I created)
exports.getMyArtworks = async (req, res, next) => {
    try {
        const artworks = await Product.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            artworks
        });
    } catch (error) {
        next(error);
    }
};

// Get My Orders (Items I bought)
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ buyer: req.user.id })
            .populate('product')
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendRazorpayKey: exports.sendRazorpayKey,
    processPayment: exports.processPayment,
    createOrder: exports.createOrder,
    processCartPayment: exports.processCartPayment,
    verifyCartPayment: exports.verifyCartPayment,
    getMyOrderStats: exports.getMyOrderStats,
    getMyArtworks: exports.getMyArtworks,
    getMyOrders: exports.getMyOrders
};
