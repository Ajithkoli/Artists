const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    photoUrl: { type: String, required: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 300 },
    story: { type: String, required: true, maxlength: 500 },
    tags: [{ type: String, required: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    views: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
