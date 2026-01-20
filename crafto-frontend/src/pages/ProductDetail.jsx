import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/axios'
import {
  Heart,
  Share2,
  MessageCircle,
  Star,
  Eye,
  ShoppingCart,
  DollarSign,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Send
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { useCart } from '../contexts/CartContext';
import { useTranslation } from 'react-i18next';
import Bynow from './popup_function';

const ProductDetail = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [aiDescription, setAiDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const [commentText, setCommentText] = useState("")
  const [userRating, setUserRating] = useState(5)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${id}`);
        const data = response.data;

        if (data.product) {
          const p = data.product;
          setProduct({
            ...p,
            images: p.images || (p.photo ? [p.photo.startsWith('http') ? p.photo : `${apiClient.defaults.baseURL}/watermark${p.photo}`] : []),
            artist: p.user?.name || 'Artist',
            tags: p.tags || [],
            reviews: p.reviews || [],
            rating: p.rating !== undefined ? p.rating : 0,
            numReviews: p.numReviews || 0,
            views: p.views || 0,
            likes: p.likes || [],
            comments: p.comments || [],
            dimensions: p.dimensions || "Unknown",
            medium: p.medium || "Digital",
            year: p.year || "2024",
            story: p.story || "No story provided.",
          });
          if (user) {
            setIsLiked(p.likes?.some(l => (l._id || l) === user._id));
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      }
    };

    if (id) fetchProduct();
  }, [id])

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to like products");
      return;
    }
    try {
      const res = await apiClient.post(`/products/${id}/like`);
      setIsLiked(res.data.isLiked);
      setProduct(prev => ({
        ...prev,
        likes: res.data.isLiked
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter(l => (l._id || l) !== user._id)
      }));
      toast.success(res.data.isLiked ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      toast.error("Action failed");
    }
  }

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to comment");
      return;
    }
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await apiClient.post(`/products/${id}/comment`, { text: commentText, rating: userRating });

      // Update product with new comments and potential new rating if returned
      // Ideally backend returns updated rating too, but for now we trust the comments update or re-fetch if needed.
      // But the controller returns { comments: ... }. The rating calculation happens on backend.
      // We might need to handle rating update in UI manually or rely on re-fetch.
      // The controller returns `updatedProduct.comments`. 
      // Let's assume we want to view the new rating immediately. 
      // Usually it's better to refetch the whole product or have the backend return the new rating.
      // Current controller: `res.json({ success: true, comments: updatedProduct.comments });`
      // It DOES NOT return the new rating. 
      // I should update the controller to return the new rating as well, OR just update comments and let the rating be stale until refresh.
      // Wait, I can calculate it locally or just accept it's slightly stale.
      // Actually, let's just update comments for now.

      setProduct(prev => {
        const newComments = res.data.comments;
        const newRating = newComments.reduce((acc, item) => (item.rating || 5) + acc, 0) / newComments.length;
        return { ...prev, comments: newComments, rating: newRating, numReviews: newComments.length };
      });

      setCommentText("");
      setUserRating(5);
      toast.success("Comment added!");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.title,
        text: `Check out this amazing artwork: ${product.title} by ${product.artist}`,
        url: window.location.href
      })
    } catch (error) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Link copied to clipboard!')
    }
  }

  const generateAIDescription = async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // In a real app, you would call your AI endpoint here
    const aiText = `"Abstract Harmony" is a masterful exploration of chromatic relationships and emotional depth. The artist employs a sophisticated palette of complementary and analogous colors to create visual tension and resolution. The dynamic brushwork demonstrates advanced technical skill, with each stroke contributing to the overall narrative of balance and contrast.`

    setAiDescription(aiText)
    setShowAI(true)
    setIsGenerating(false)
    toast.success('AI description generated!')
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10 pt-28 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="sticky top-32"
            >
              <div className="relative rounded-[40px] overflow-hidden bg-base-content/5 border border-base-content/10 group aspect-square shadow-2xl">
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Immersive Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

                {product.images.length > 1 && (
                  <div className="absolute inset-x-0 bottom-8 flex justify-center gap-3">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`transition-all duration-300 rounded-full ${selectedImage === index
                          ? 'w-10 h-2 bg-primary-600'
                          : 'w-2 h-2 bg-base-content/30 hover:bg-base-content/50'
                          }`}
                      />
                    ))}
                  </div>
                )}

                {/* Favorite Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className={`absolute top-8 right-8 p-5 rounded-3xl backdrop-blur-2xl border transition-all ${isLiked
                    ? 'bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'bg-base-100/10 border-base-content/20 text-base-content hover:bg-base-100/20'
                    }`}
                >
                  <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {/* Smaller Thumbnails if multiple images exist */}
              {product.images.length > 1 && (
                <div className="flex gap-4 mt-8">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === index
                        ? 'border-primary-600 shadow-lg'
                        : 'border-base-content/10 opacity-50 hover:opacity-100 hover:border-base-content/30'
                        }`}
                    >
                      <img src={image} className="w-full h-full object-cover" alt="thumb" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-10"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 text-xs font-black tracking-widest uppercase">
                  {product.category || 'Celestial'}
                </span>
                <div className="h-1 w-1 bg-white/20 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-secondary-500 fill-current" />
                  <span className="text-base-content font-bold">
                    {Number(product.rating).toFixed(1)} ({product.numReviews || product.comments.length})
                  </span>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-serif font-black text-base-content mb-4 tracking-tighter leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-base-900 flex items-center justify-center font-black text-white text-xs">
                    {product.artist[0]}
                  </div>
                </div>
                <div>
                  <p className="text-base-content/40 text-xs font-black uppercase tracking-widest">{t('product_detail.architect')}</p>
                  <p className="text-base-content font-bold text-lg">{product.artist}</p>
                  <p className="text-primary-600 text-xs font-bold uppercase tracking-widest mt-1">
                    {t('origin', { place: product.origin || 'India' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[32px] bg-base-100 border border-base-content/10 space-y-8 shadow-2xl">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-base-content/40 text-xs font-black uppercase tracking-widest mb-1">{t('product_detail.current_value')}</p>
                  <div className="text-5xl font-black text-base-content tracking-tighter flex items-center">
                    <span className="text-primary-600 mr-2 text-3xl">$</span>
                    {product.price ? product.price.toLocaleString() : '0'}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base-content/40 text-xs font-black uppercase tracking-widest mb-1">{t('product_detail.engagement')}</p>
                  <div className="flex items-center gap-4 text-base-content/60 font-bold">
                    <span className="flex items-center gap-1.5"><Eye size={16} className="text-primary-600" /> {product.views || 0}</span>
                    <span className="flex items-center gap-1.5"><Heart size={16} className="text-secondary-500" /> {product.likes?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Bynow selectedProduct={product} />
                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-base-content/5 border border-base-content/10 hover:bg-base-content/10 transition-all text-base-content font-bold"
                >
                  <ShoppingCart size={20} />
                  <span>{t('product_detail.add_collection')}</span>
                </button>
              </div>

              {/* AI Insight */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 rounded-2xl bg-base-200 border border-base-content/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-secondary-500" />
                      <span className="font-black text-xs uppercase tracking-[0.2em] text-base-content">{t('product_detail.neural_insight')}</span>
                    </div>
                    {!showAI && !isGenerating && (
                      <button
                        onClick={generateAIDescription}
                        className="text-[10px] font-black uppercase text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {t('product_detail.unlock_ai')}
                      </button>
                    )}
                  </div>

                  {isGenerating ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-2 bg-white/10 rounded w-full"></div>
                      <div className="h-2 bg-white/10 rounded w-5/6"></div>
                    </div>
                  ) : showAI ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-base-content/70 italic leading-relaxed"
                    >
                      {aiDescription}
                    </motion.p>
                  ) : (
                    <p className="text-xs text-base-content/40">{t('product_detail.ai_generated')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications Tabbed Look (simplified) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: t('product_detail.year'), value: product.year },
                { label: t('product_detail.medium'), value: product.medium },
                { label: t('product_detail.dimensions'), value: product.dimensions },
                { label: t('product_detail.format'), value: '4K Digital' }
              ].map((spec) => (
                <div key={spec.label} className="p-4 rounded-2xl bg-base-content/5 border border-base-content/5 text-center">
                  <p className="text-[10px] font-black uppercase text-base-content/30 mb-1">{spec.label}</p>
                  <p className="text-sm font-bold text-base-content">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6 pt-6">
              <div>
                <h3 className="text-xl font-black text-base-content mb-3 tracking-tighter">{t('product_detail.vision')}</h3>
                <p className="text-base-content/60 leading-relaxed font-medium">
                  {product.story || product.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-base-content/5 hover:bg-base-content/10 border border-base-content/10 rounded-xl text-xs font-bold text-base-content/60 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share Section */}
            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <p className="text-sm font-bold text-base-content/40">{t('product_detail.spread_vision')}</p>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-base-content/5 hover:bg-base-content/10 border border-base-content/5 transition-all text-base-content font-black text-xs uppercase tracking-widest"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
                <span>{copied ? t('product_detail.copied') : t('product_detail.share')}</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="pt-12 space-y-8">
              <h3 className="text-2xl font-serif font-black text-base-content tracking-tighter">
                {t('product_detail.comments')} ({product.comments?.length || 0})
              </h3>

              {/* Add Comment */}
              <form onSubmit={handleComment} className="flex flex-col gap-4">
                {/* Rating Input */}
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className={`focus:outline-none transition-transform hover:scale-110 ${star <= userRating ? "text-yellow-400" : "text-gray-300"
                        }`}
                    >
                      <Star
                        size={24}
                        fill={star <= userRating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-base-content/60 font-bold ml-2">
                    {userRating}.0
                  </span>
                </div>

                <div className="flex gap-4">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('product_detail.comment_placeholder')}
                    className="flex-1 bg-base-100 border border-base-content/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-base-content"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="p-3 bg-secondary-500 text-white rounded-xl hover:bg-secondary-600 transition-all disabled:opacity-50 shadow-glow-secondary"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {product.comments?.length > 0 ? (
                  product.comments.map((comment, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-3xl bg-base-100 border border-base-content/5 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center text-white font-bold text-sm">
                        {(comment.user?.name || 'U')[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col">
                            <h4 className="font-bold text-base-content text-sm">{comment.user?.name || 'Collector'}</h4>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < (comment.rating || 5) ? "text-yellow-400 fill-current" : "text-gray-300"}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-widest">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-base-content/70 text-sm leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 rounded-3xl bg-base-content/5 border border-dashed border-base-content/10">
                    <p className="text-base-content/40 italic text-sm">{t('product_detail.no_comments')}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
