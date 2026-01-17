import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/axios'
import { Star, Heart, Eye, ShoppingCart, Search } from 'lucide-react'
import { FileText, LayoutGrid } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Explore = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("");

  const { t } = useTranslation();

  // ✅ Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const res = await apiClient.get('/explore')
        // backend returns { success: true, posts: [...] }
        const receivedPosts = res.data?.posts || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setPosts(receivedPosts);
      } catch (err) {
        console.error(err)
        setError(t('explore.error.desc'))
      } finally {
        setLoading(false)
      }
    }
    fetchPosts();
    const interval = setInterval(() => {
      fetchPosts();
    }, 50000); // 50 seconds
    return () => clearInterval(interval);
  }, [t])
  //const img = ;
  console.log("hiii", posts)

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <div className="py-24 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-serif font-black text-base-content mb-6 tracking-tighter"
          >
            {t('explore.title')}
          </motion.h1>
          <p className="text-xl text-base-content/60 max-w-2xl mx-auto font-medium">
            {t('explore.subtitle')}
          </p>
          <div className="max-w-xl mx-auto mt-12 relative group">
            <div className="absolute inset-0 bg-secondary-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl"></div>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-secondary-400 transition-colors" size={20} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('explore.search_placeholder')}
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-base-100 border border-base-content/10 focus:border-secondary-500/50 outline-none transition-all placeholder:text-base-content/30 text-base-content font-medium shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <span className="loading loading-ring loading-lg text-primary-400"></span>
          <p className="text-base-content/50 font-bold uppercase tracking-widest text-sm">{t('explore.loading')}</p>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-error/5 border border-error/20 text-center">
          <p className="text-error font-bold mb-2">{t('explore.error.title')}</p>
          <p className="text-sm text-error/60">{error}</p>
        </div>
      )}

      {/* Posts Grid */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts
            .filter(post => post.title?.toLowerCase().includes(search.toLowerCase()))
            .map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="card-premium overflow-hidden flex flex-col p-1"
              >
                <div className="relative h-72 overflow-hidden rounded-2xl">
                  <img
                    src={post.photoUrl?.startsWith('http') ? post.photoUrl : `${import.meta.env.VITE_API_BASE_URL}${post.photoUrl}`}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold text-white tracking-widest uppercase">
                        {t('explore.architecture')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-base-content group-hover:text-primary-600 transition-colors line-clamp-1">{post.title}</h3>
                  <p className="text-base-content/60 text-sm mb-6 line-clamp-3 leading-relaxed font-medium">
                    {post.story || post.description}
                  </p>

                  <div className="flex items-center space-x-4 mb-8">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-base-content/40">
                      <Heart size={14} className="text-secondary-400" />
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-base-content/40">
                      <Eye size={14} className="text-primary-400" />
                      <span>{post.views || 0}</span>
                    </div>
                  </div>

                  <Link
                    to={`/explore/${post._id}`}
                    className="mt-auto group flex items-center justify-center space-x-2 w-full py-4 rounded-xl bg-base-content/5 hover:bg-base-content/10 border border-base-content/5 transition-all text-sm font-bold text-base-content"
                  >
                    <span>{t('explore.view_story')}</span>
                    <FileText size={16} className="group-hover:text-primary-400 transition-colors" />
                  </Link>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  )
}

export default Explore
