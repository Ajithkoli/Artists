// File: middleware/watermark.middleware.js
const cloudinary = require("../config/cloudinary");

const watermarkMiddleware = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        // req.file.path is the original Cloudinary URL
        // req.file.filename is the public_id (including folder)

        const artistName = req.user?.name || "Archicanvas";
        const watermarkText = `© ${artistName}`;

        // Construct a transformed URL
        // We use Cloudinary's overlay feature: l_text:[font_family]_[font_size]:[text],g_center,o_20
        // We need to encode the watermark text properly for Cloudinary
        const encodedText = encodeURIComponent(watermarkText);

        // Split the path to insert transformations
        // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/[transformations]/[public_id].[ext]
        const urlParts = req.file.path.split('/upload/');
        const transformation = `l_text:Arial_80_bold:${encodedText},o_30,g_center/`;

        const watermarkedUrl = `${urlParts[0]}/upload/${transformation}${urlParts[1]}`;

        // Update the request object so the controller uses the watermarked URL
        req.file.path = watermarkedUrl;
        req.file.url = watermarkedUrl;

        next();
    } catch (error) {
        console.error("Watermark middleware error:", error);
        // Fallback to original path if transformation fails
        next();
    }
};

module.exports = watermarkMiddleware;
