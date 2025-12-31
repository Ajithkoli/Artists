import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { motion } from "framer-motion";
import apiClient from '../api/axios'
const MAX_TAGS = 10;

const PostCreator = ({ open, onClose, onSubmit }) => {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleTagInput = (e) => setTagInput(e.target.value);

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
    if (!photo || !title || !description || !story) return setError("All fields are required");
    if (tags.length === 0) return setError("At least one tag is required");

    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("story", story);
    formData.append("tags", JSON.stringify(tags));

    try {
      const res = await apiClient.post('/explore', formData);

      onSubmit(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to submit post");
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
          Share Your <span className="text-gradient">Journey</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 ml-1">Visual Asset</label>
            <div className={`relative group transition-all duration-300 ${!preview ? 'border-2 border-dashed border-white/10 hover:border-primary-500/30 rounded-2xl p-8 text-center' : ''}`}>
              {!preview ? (
                <>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="flex flex-col items-center">
                    <Plus className="w-10 h-10 text-primary-400/50 mb-2" />
                    <p className="text-sm font-bold text-white/30">Drop your masterpiece here</p>
                  </div>
                </>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
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
              <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2 ml-1">Vision Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-white placeholder:text-white/20 font-medium"
                placeholder="Name your creation..."
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2 ml-1">Brief Insight</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-white placeholder:text-white/20 font-medium"
                placeholder="A whisper of reality..."
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 mb-2 ml-1">The Epic Story</label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-white placeholder:text-white/20 font-medium resize-none"
                rows={4}
                placeholder="Tell us about the light, the shadows, the soul..."
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-base-content/40 ml-1">Universal Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInput}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all text-white placeholder:text-white/20"
                  placeholder="Add dimension..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <button type="button" onClick={handleAddTag} className="bg-primary-500/20 text-primary-400 font-bold px-6 rounded-xl border border-primary-500/30 hover:bg-primary-500 hover:text-white transition-all">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <motion.span
                    key={tag}
                    className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-2 group/tag"
                    whileHover={{ scale: 1.05 }}
                  >
                    {tag}
                    <X size={14} className="text-white/40 group-hover/tag:text-red-400 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-white/50 hover:text-white font-bold transition-colors">Discard</button>
            <button type="submit" className="flex-[2] py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.2em] shadow-glow-primary active:scale-95 transition-all">
              Initialize Post
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PostCreator;
