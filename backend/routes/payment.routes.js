const express = require("express");
const router = express.Router();
const { processPayment, sendRazorpayKey, createOrder } = require("../controllers/paymentController");
const { isAuthenticatedUser } = require("../middleware/auth");

router.get("/razorpaykey", isAuthenticatedUser, sendRazorpayKey);
router.post("/process", isAuthenticatedUser, processPayment);
router.post("/order", isAuthenticatedUser, createOrder);

module.exports = router;
