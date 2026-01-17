import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { Heart, Share2, MessageCircle, ArrowLeft, Eye, Bookmark, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ViewPost = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [showFullStory, setShowFullStory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/explore/${id}`);
        const receivedPost = res.data?.post || res.data;
        setPost(receivedPost);
        if (user && receivedPost) {
          setIsLiked(receivedPost.likes?.some(l => (l._id || l) === user._id));
        }
      } catch (err) {
        setError(t('view_post.load_fail'));
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error(t('view_post.like_login'));
      return;
    }
    try {
      const res = await apiClient.post(`/explore/${id}/like`);
      setIsLiked(res.data.isLiked);
      setPost(prev => ({
        ...prev,
        likes: res.data.isLiked
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter(l => (l._id || l) !== user._id)
      }));
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(t('view_post.comment_login'));
      return;
    }
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await apiClient.post(`/explore/${id}/comment`, { text: commentText });
      setPost(prev => ({ ...prev, comments: res.data.comments }));
      setCommentText("");
      toast.success(t('view_post.comment_success'));
    } catch (err) {
      toast.error(t('view_post.comment_fail'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) return <div className="text-center py-20">{t('view_post.loading')}</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!post) return null;

  // Story truncation logic
  const storyLimit = 200;
  const isLongStory = post.story && post.story.length > storyLimit;
  const displayedStory = showFullStory || !isLongStory
    ? post.story
    : post.story.slice(0, storyLimit) + '...';

  return (
    <div className="min-h-screen bg-transparent py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="group flex items-center space-x-2 text-base-content/50 hover:text-primary-600 transition-colors mb-12 font-bold uppercase tracking-widest text-sm"
          onClick={() => navigate('/explore')}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>{t('view_post.back')}</span>
        </motion.button>

        {/* Post Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium overflow-hidden p-1 group h-full"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img
                src={post.photoUrl?.startsWith('http') ? post.photoUrl : `${apiClient.defaults.baseURL}${post.photoUrl}`}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col space-y-8"
          >
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-black tracking-widest uppercase text-primary-400">
                  {t('view_post.badge')}
                </span>
                <div className="h-1 w-1 bg-white/20 rounded-full"></div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-base-content/40 uppercase tracking-widest">
                  <Eye size={14} className="text-secondary-400" />
                  <span>{post.views || 0} {t('view_post.views')}</span>
                </div>
                <div className="h-1 w-1 bg-white/20 rounded-full"></div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-base-content/40 uppercase tracking-widest">
                  <Heart size={14} className="text-red-400" />
                  <span>{post.likes?.length || 0} {t('view_post.likes')}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-serif font-black text-base-content mb-6 tracking-tighter leading-tight">
                {post.title}
              </h1>

              <div className="p-8 rounded-3xl bg-base-200 border border-base-content/10 space-y-6">
                <p className="text-xl text-base-content/90 font-medium italic leading-relaxed">
                  "{post.description || 'A journey through architectural excellence.'}"
                </p>

                <div className="h-px bg-base-content/5 w-full"></div>

                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-base-content/40 flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-secondary-500"></span>
                    <span>{t('view_post.narrative')}</span>
                  </p>
                  <p className="text-base-content/70 leading-relaxed font-medium">
                    {displayedStory || t('view_post.enigma')}
                  </p>

                  {isLongStory && (
                    <button
                      className="text-primary-600 hover:text-primary-700 text-sm font-bold uppercase tracking-widest transition-colors"
                      onClick={() => setShowFullStory(!showFullStory)}
                    >
                      {showFullStory ? t('view_post.close') : t('view_post.unravel')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleLike}
                className={`flex-1 py-4 rounded-2xl border transition-all font-bold flex items-center justify-center space-x-3 ${isLiked
                  ? 'bg-red-500/10 border-red-500/20 text-red-500'
                  : 'bg-base-content/5 border-base-content/10 hover:bg-base-content/10 text-base-content'
                  }`}
              >
                <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                <span>{isLiked ? t('view_post.liked') : t('view_post.like')}</span>
              </button>
              <button
                className="flex-1 py-4 rounded-2xl bg-base-content/5 border border-base-content/10 hover:bg-base-content/10 transition-all font-bold text-base-content flex items-center justify-center space-x-3"
                onClick={() => document.getElementById('comment-input')?.focus()}
              >
                <MessageCircle size={20} className="text-primary-600" />
                <span>{t('view_post.comment_btn')}</span>
              </button>
              <button className="p-4 rounded-2xl bg-base-content/5 border border-base-content/10 hover:bg-base-content/10 transition-all text-base-content">
                <Bookmark size={20} />
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-12 space-y-8">
              <h3 className="text-2xl font-serif font-black text-base-content tracking-tighter">
                {t('view_post.comments_count', { count: post.comments?.length || 0 })}
              </h3>

              {/* Add Comment */}
              <form onSubmit={handleComment} className="flex gap-4">
                <input
                  id="comment-input"
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('view_post.comment_placeholder')}
                  className="flex-1 bg-base-200 border border-base-content/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-base-content"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {post.comments?.length > 0 ? (
                  post.comments.map((comment, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-base-200 border border-base-content/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                        {(comment.user?.name || 'U')[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-base-content text-sm">{comment.user?.name || 'Anonymous User'}</h4>
                          <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-widest">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-base-content/70 text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-base-content/40 italic text-sm">{t('view_post.no_comments')}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ViewPost;
