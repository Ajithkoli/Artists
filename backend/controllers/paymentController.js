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
