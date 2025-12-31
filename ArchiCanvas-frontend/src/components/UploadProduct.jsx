import React, { useState } from "react";
import apiClient from '../api/axios'
import { X, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";

const MAX_TAGS = 10;

const ProductCreator = ({ open, onClose }) => {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isBiddable, setIsBiddable] = useState(false);
  const [biddingDays, setBiddingDays] = useState(1);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleAddTag = () => {
    let tag = tagInput.trim();
    if (!tag) return;
    if (tags.length >= MAX_TAGS) return setError("Maximum 10 tags allowed");
    if (!tag.startsWith("#")) tag = `#${tag}`;
    if (tags.includes(tag)) return setError("Tag already added");
    setTags([...tags, tag]);
    setTagInput("");
    setError("");
  };

  const handleRemoveTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo || !title || !description || !price)
      return setError("All fields are required");

    try {
      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("isBiddable", isBiddable);
      if (isBiddable) {
        formData.append("biddingDays", biddingDays);
      }
      formData.append("tags", JSON.stringify(tags));

      const res = await apiClient.post(`/products`, formData);

      console.log("Uploaded:", res.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    }
  };

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-card backdrop-blur-3xl rounded-[32px] shadow-2xl w-full max-w-lg relative p-8 md:p-10 max-h-[90vh] overflow-y-auto border border-white/10"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <button
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-serif font-black text-white text-center mb-8 tracking-tighter">
          Mint New <span className="text-gradient">Asset</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 text-white">
          {/* Photo Upload */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 ml-1">Universal Asset (Photo)</label>
            <div className={`relative group transition-all duration-300 ${!preview ? 'border-2 border-dashed border-white/10 hover:border-primary-500/30 rounded-2xl p-8 text-center' : ''}`}>
              {!preview ? (
                <>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="flex flex-col items-center">
                    <Plus className="w-10 h-10 text-primary-400/50 mb-2" />
                    <p className="text-sm font-bold text-white/30">Drop your file into the galaxy</p>
                  </div>
                </>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPreview(""); setPhoto(null); }}
                    className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-2 rounded-xl text-white hover:bg-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2 ml-1">Asset Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-white placeholder:text-white/20 font-medium"
                placeholder="Enter masterpiece title..."
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2 ml-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-white placeholder:text-white/20 font-medium resize-none"
                rows={2}
                placeholder="Tell the story of this creation..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2 ml-1">Price (Credits)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2 ml-1">Negotiable</label>
                <div
                  onClick={() => setIsBiddable(!isBiddable)}
                  className={`w-full h-[52px] cursor-pointer rounded-xl border border-white/10 flex items-center px-4 transition-all ${isBiddable ? 'bg-primary-500/20 border-primary-500/40' : 'bg-white/5'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 mr-3 transition-all flex items-center justify-center ${isBiddable ? 'bg-primary-400 border-primary-400' : 'border-white/20'}`}>
                    {isBiddable && <Check size={14} className="text-black" />}
                  </div>
                  <span className={`text-sm font-bold ${isBiddable ? 'text-primary-400' : 'text-white/40'}`}>Enable Bidding</span>
                </div>
              </div>
            </div>

            {isBiddable && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2 ml-1">Auction Duration (Solar Cycles)</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={biddingDays}
                  onChange={(e) => setBiddingDays(e.target.value)}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-[10px] font-black text-white/40 px-1 mt-1">
                  <span>1 CYCLE</span>
                  <span>2 CYCLES</span>
                  <span>3 CYCLES</span>
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 ml-1">Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-white placeholder:text-white/20"
                  placeholder="Add hashtag..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <button type="button" onClick={handleAddTag} className="bg-primary-500/20 text-primary-400 font-bold px-6 rounded-xl border border-primary-500/30 hover:bg-primary-500 hover:text-white transition-all">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 border border-white/10 rounded-full flex items-center gap-2 text-xs font-bold"
                  >
                    {tag}
                    <X size={14} className="cursor-pointer text-white/40 hover:text-red-400" onClick={() => handleRemoveTag(tag)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-white/50 hover:text-white font-bold transition-colors">Discard</button>
            <button type="submit" className="flex-[2] py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.2em] shadow-glow-primary active:scale-95 transition-all">
              Initialize Mint
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductCreator;
