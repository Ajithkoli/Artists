const express = require("express");
const router = express.Router();
const {
    processPayment,
    sendRazorpayKey,
    createOrder,
    processCartPayment,
    verifyCartPayment,
    getMyOrderStats,
    getMyArtworks,
    getMyOrders
} = require("../controllers/paymentController");
const { isAuthenticatedUser } = require("../middleware/auth");

router.get("/razorpaykey", isAuthenticatedUser, sendRazorpayKey);
router.get("/stats", isAuthenticatedUser, getMyOrderStats);
router.get("/my-artworks", isAuthenticatedUser, getMyArtworks);
router.get("/my-orders", isAuthenticatedUser, getMyOrders);
router.post("/process", isAuthenticatedUser, processPayment);
router.post("/order", isAuthenticatedUser, createOrder);
router.post("/process-cart", isAuthenticatedUser, processCartPayment);
router.post("/verify-cart", isAuthenticatedUser, verifyCartPayment);

module.exports = router;
