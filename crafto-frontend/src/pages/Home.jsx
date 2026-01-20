import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Palette,
  Building2,
  Users,
  Star,
  Heart,
  Eye,
  ShoppingCart
} from 'lucide-react'

const Home = () => {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  // Mock featured artworks data
  // Products state to replace mock data
  const [featuredArtworks, setFeaturedArtworks] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await apiClient.get(`/products`);
        if (response.data?.products) {
          // Take only the first 4 products for the featured section
          // Transform if necessary to match the UI shape, though the ProductCard now handles the backend shape well.
          // The backend returns: { _id, title, price, photo, user: {name}, rating, etc. }
          // We map it to what the UI expects if fields differ
          const mapped = response.data.products.slice(0, 4).map(p => ({
            id: p._id,
            title: p.title,
            artist: p.user?.name || "Artist",
            price: `₹${p.price}`,
            // Use the watermark path for the image
            image: p.photo?.startsWith('http') ? p.photo : `${apiClient.defaults.baseURL}/watermark${p.photo}`,
            category: p.tags?.[0] || "Art", // Use first tag as category or default
            rating: p.rating !== undefined ? p.rating : 0,
            likes: p.likes?.length || 0,
            views: p.views || 0
          }));
          setFeaturedArtworks(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch featured products", error);
      }
    };
    fetchFeatured();
  }, []);

  const stats = [
    { number: "500+", label: t('stats.artists'), icon: Palette },
    { number: "2000+", label: t('stats.buyers'), icon: Users },
    { number: "100+", label: t('stats.communities'), icon: Building2 },
    { number: "50K+", label: t('stats.artworks'), icon: Star }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/20 blur-[150px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-500/20 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card border border-white/10 mb-8"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
              <span className="text-sm font-bold text-base-content tracking-widest uppercase">{t('hero.tagline')}</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-8xl lg:text-9xl font-serif font-black text-base-content mb-8 leading-[0.9] tracking-tighter"
              dangerouslySetInnerHTML={{ __html: t('hero.title') }}
            ></motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-base-content/60 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
            >
              <Link to="/explore" className="btn-primary text-lg md:text-xl px-8 md:px-10 py-4 md:py-5 group w-full sm:w-auto">
                {t('hero.enter_gallery')}
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link to="/community" className="px-8 md:px-10 py-4 md:py-5 rounded-xl border-2 border-base-content/10 hover:border-primary-500/50 hover:bg-base-content/5 transition-all text-lg md:text-xl font-bold text-base-content w-full sm:w-auto">
                {t('hero.join_fold')}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-gentle">
          <div className="w-6 h-10 border-2 border-base-content/20 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-3 bg-base-content/50 rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-primary-500/20 blur-2xl group-hover:bg-primary-500/40 transition-colors rounded-full"></div>
                  <div className="relative w-20 h-20 bg-base-100 rounded-2xl flex items-center justify-center mx-auto border border-base-content/10 group-hover:border-primary-500/50 transition-all duration-500 transform group-hover:rotate-[10deg]">
                    <stat.icon className="w-10 h-10 text-primary-400" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-black text-base-content mb-2 tracking-tighter">
                  {stat.number}
                </div>
                <div className="text-xs font-black text-base-content/50 uppercase tracking-[0.2em]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-serif font-black text-base-content mb-6 tracking-tighter">
                {t('featured.title')}
              </h2>
              <p className="text-xl text-base-content/60 font-medium">
                {t('featured.subtitle')}
              </p>
            </div>
            <Link to="/explore" className="group flex items-center space-x-3 text-base-content font-bold text-lg hover:text-primary-600 transition-colors">
              <span>{t('featured.view_all')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {featuredArtworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                variants={itemVariants}
              >
                {/* We use the updated ProductCard here indirectly by mapping or directly if we wanted, 
                    but Home.jsx has its own card implementation currently. 
                    I'll update the inline card here to match the ProductCard aesthetic. */}
                <div className="card-premium overflow-hidden group h-full flex flex-col p-1">
                  <div className="relative h-64 overflow-hidden rounded-xl">
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-base-100/10 backdrop-blur-md rounded-full border border-base-content/20">
                      <span className="text-[10px] font-bold text-base-content tracking-widest uppercase">
                        {artwork.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-base-content mb-1 group-hover:text-primary-600 transition-colors truncate">
                      {artwork.title}
                    </h3>
                    <p className="text-xs text-base-content/50 uppercase tracking-widest font-bold mb-6">
                      {t('featured.by', { artist: artwork.artist })}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-base-content/40 font-black uppercase tracking-widest leading-none mb-1">{t('featured.price')}</span>
                        <span className="text-2xl font-black text-base-content tracking-tighter">{artwork.price}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-base-content/40 font-bold">
                        <div className="flex items-center space-x-1">
                          <Eye size={14} className="text-primary-500" />
                          <span>{artwork.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart size={14} className="text-secondary-500" />
                          <span>{artwork.likes}</span>
                        </div>
                        <Link
                          to={`/product/${artwork.id}`}
                          className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-300"
                        >
                          <ShoppingCart size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-700 p-12 md:p-24 text-center group"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
              <div className="absolute inset-0 bg-grid-white"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2
                className="text-4xl md:text-7xl font-serif font-black text-white mb-8 tracking-tighter leading-tight text-glow"
                dangerouslySetInnerHTML={{ __html: t('cta.title') }}
              >
              </h2>
              <p className="text-xl text-white/80 font-medium mb-12">
                {t('cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                {!isAuthenticated ? (
                  <Link to="/register" className="bg-white text-primary-600 hover:scale-105 active:scale-95 font-bold py-5 px-10 rounded-2xl transition-all shadow-xl shadow-black/20">
                    {t('cta.get_started')}
                  </Link>
                ) : (
                  <Link
                    to={user?.role === 'artist' ? '/seller-dashboard' : '/profile'}
                    className="bg-white text-primary-600 hover:scale-105 active:scale-95 font-bold py-5 px-10 rounded-2xl transition-all shadow-xl shadow-black/20"
                  >
                    {t('cta.dashboard')}
                  </Link>
                )}
                <Link to="/explore" className="bg-black/20 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-bold py-5 px-10 rounded-2xl transition-all">
                  {t('cta.browse')}
                </Link>
              </div>
            </div>

            {/* Floating Orbs in CTA */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/20 blur-3xl rounded-full"></div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

export default Home
