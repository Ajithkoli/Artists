const User = require("../models/user.model");

const uploadArtwork = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const artistName = req.body.username || "Anonymous Artist";
    const watermarkText = `© ${artistName}`;
    const encodedText = encodeURIComponent(watermarkText);

    // Construction of watermarked URL via Cloudinary transformations
    const urlParts = req.file.path.split('/upload/');
    const transformation = `l_text:Arial_80_bold:${encodedText},o_30,g_center/`;
    const finalUrl = `${urlParts[0]}/upload/${transformation}${urlParts[1]}`;

    // Update artworkCount and badges for artist
    if (req.body.userId) {
      const user = await User.findById(req.body.userId);
      if (user && user.role === 'artist') {
        user.artworkCount = (user.artworkCount || 0) + 1;
        user.updateBadges();
        await user.save();
      }
    }

    res.status(200).json({
      message: "File uploaded and watermarked successfully!",
      imageUrl: finalUrl,
    });
  } catch (error) {
    console.error("Error during upload:", error);
    res.status(500).json({ error: "Failed to process image." });
  }
};

module.exports = { uploadArtwork };

