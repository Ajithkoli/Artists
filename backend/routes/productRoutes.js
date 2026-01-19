const express = require("express");
const router = express.Router();
const upload = require("../middleware/multur");
const {
    createProduct,
    getProducts,
    getProductById,
    notifyArtistForPurchase,
    toggleLikeProduct,
    addCommentToProduct,
    deleteProduct
} = require("../controllers/productController");
const { isAuthenticatedUser } = require("../middleware/auth");
const watermarkMiddleware = require('../middleware/watermark.middleware');
// Upload product
router.post("/", isAuthenticatedUser, upload.single("photo"), watermarkMiddleware, createProduct);

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);
router.post("/:id/buy-request", isAuthenticatedUser, notifyArtistForPurchase);

// Engagement routes
router.post("/:id/like", isAuthenticatedUser, toggleLikeProduct);
router.post("/:id/comment", isAuthenticatedUser, addCommentToProduct);
router.delete("/:id", isAuthenticatedUser, deleteProduct);


module.exports = router;
