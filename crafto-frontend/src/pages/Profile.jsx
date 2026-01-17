import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  User,
  Mail,
  Palette,
  Edit3,
  Save,
  X,
  Camera,
  Settings,
  Heart,
  ShoppingBag,
  BookOpen,
  Users,
  Shield,
  Bell,
  Globe,
  Plus
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import PostCreator from '../components/PostCreator'
import UploadProduct from '../components/UploadProduct'
import toast from 'react-hot-toast'
import Badges from './Badges'
import apiClient from '../api/axios'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const { t } = useTranslation()
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [showUploadProductModal, setShowUploadProductModal] = useState(false)
  const [showBadgesModal, setShowBadgesModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    specialization: user?.specialization || ''
  })
  const [orderStats, setOrderStats] = useState({ buyerCount: 0, sellerCount: 0 })
  const [myArtworks, setMyArtworks] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [activeTab, setActiveTab] = useState('activity') // 'activity', 'artworks', 'orders'
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, artworksRes, ordersRes] = await Promise.all([
          apiClient.get('/payment/stats'),
          apiClient.get('/payment/my-artworks'),
          apiClient.get('/payment/my-orders')
        ])

        if (statsRes.data.success) {
          setOrderStats({
            buyerCount: statsRes.data.buyerCount,
            sellerCount: statsRes.data.sellerCount
          })
        }
        if (artworksRes.data.success) setMyArtworks(artworksRes.data.artworks)
        if (ordersRes.data.success) setMyOrders(ordersRes.data.orders)
      } catch (error) {
        console.error("Failed to fetch profile data:", error)
      }
    }
    if (user) fetchData()
  }, [user])

  const handleSave = async () => {
    try {
      await updateProfile(editForm)
      setIsEditing(false)
    } catch (error) {
      toast.error(t('profile.save_fail') || 'Failed to update profile')
    }
  }

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      bio: user?.bio || '',
      specialization: user?.specialization || ''
    })
    setIsEditing(false)
  }

  const handleChange = (e) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const stats = [
    { label: t('profile.stats.artworks'), value: user?.artworkCount || 0, icon: Palette, color: 'text-primary-600' },
    { label: t('profile.stats.purchases') || t('cart.title'), value: orderStats.buyerCount, icon: ShoppingBag, color: 'text-success-600' },
    { label: t('profile.stats.collections') || 'Sales', value: orderStats.sellerCount, icon: BookOpen, color: 'text-blue-600' },
    { label: t('profile.stats.communities') || 'Communities', value: 3, icon: Users, color: 'text-purple-600' }
  ]

  const recentActivity = [
    { type: 'like', text: 'Liked "Abstract Harmony" by Sarah Artist', time: '2 hours ago' },
    { type: 'purchase', text: 'Purchased "Modern Architecture" by Mike Designer', time: '1 day ago' },
    { type: 'comment', text: 'Commented on "Sculptural Dreams"', time: '3 days ago' }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />
      case 'purchase': return <ShoppingBag className="w-4 h-4 text-green-500" />
      case 'comment': return <BookOpen className="w-4 h-4 text-blue-500" />
      case 'follow': return <Users className="w-4 h-4 text-purple-500" />
      default: return <User className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-base-content mb-4">
              {t('profile.title')}
            </h1>
            <p className="text-xl text-base-content/70">
              {t('profile.subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-6 sticky top-24">
              {/* Profile Image */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={
                      user.avatar
                        ? user.avatar
                        : user.role === 'admin'
                          ? 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png' // admin icon
                          : user.role === 'artist'
                            ? 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png' // artist icon
                            : user.role === 'buyer'
                              ? 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png' // buyer icon
                              : 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg'
                    }
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-primary-500 shadow-lg object-cover"
                  />
                  <button className="absolute bottom-2 right-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="text-center mb-6">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleChange}
                      className="w-full p-2 border border-base-300 rounded-lg bg-base-100 text-base-content text-center font-semibold text-lg"
                    />
                    <input
                      type="text"
                      name="specialization"
                      value={editForm.specialization}
                      onChange={handleChange}
                      className="w-full p-2 border border-base-300 rounded-lg bg-base-100 text-base-content text-center"
                      placeholder={t('auth.specialization')}
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-base-content mb-2">
                      {user?.name}
                    </h2>
                    {user?.specialization && (
                      <p className="text-primary-600 font-medium mb-2">
                        {user.specialization}
                      </p>
                    )}
                    <p className="text-base-content/70 text-sm">
                      {user?.email}
                    </p>
                  </>
                )}
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="font-semibold text-base-content mb-2">{t('profile.bio')}</h3>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border border-base-300 rounded-lg bg-base-100 text-base-content resize-none"
                    placeholder={t('profile.bio_placeholder')}
                  />
                ) : (
                  <p className="text-base-content/70 text-sm leading-relaxed">
                    {user?.bio || t('profile.no_bio')}
                  </p>
                )}
              </div>

              {/* Edit Actions */}
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="btn-primary w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t('profile.save')}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-outline w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('profile.cancel')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline w-full"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {t('profile.edit')}
                  </button>
                )}
              </div>

              {/* Badges */}
              <div className="mt-6 text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user?.role === 'admin'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  : user?.role === 'seller'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                  {user?.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                  {user?.role === 'seller' && <Palette className="w-3 h-3 mr-1" />}
                  {user?.role === 'buyer' && <User className="w-3 h-3 mr-1" />}
                  {user?.role === 'admin' ? t('auth.roles.admin') : user?.role === 'artist' ? t('auth.roles.artist') : t('auth.roles.buyer')}
                </span>
                {user?.badges && user.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {user.badges.map((badge, idx) => (
                      <span key={idx} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-base-100 rounded-xl p-6 text-center border border-base-300 shadow-sm"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-base-200 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-base-content mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-base-content/70">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Badges Section (only for artist) */}
            {user?.role === 'artist' && (
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mt-8 cursor-pointer shadow-lg hover:scale-105 transition-transform"
                onClick={() => setShowBadgesModal(true)}
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {t('profile.badges_title')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                    {t('profile.badges_prompt')}
                  </span>
                </div>
              </div>
            )}


            {/* Badges Modal */}
            {showBadgesModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
                  <button
                    className="absolute top-4 right-4 text-base-content/60 hover:text-base-content text-xl"
                    onClick={() => setShowBadgesModal(false)}
                  >
                    &times;
                  </button>
                  <Badges user={user} />
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-base-300">
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'activity' ? 'text-primary-600' : 'text-base-content/50'}`}
              >
                {t('profile.recent')}
                {activeTab === 'activity' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
              </button>
              <button
                onClick={() => setActiveTab('artworks')}
                className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'artworks' ? 'text-primary-600' : 'text-base-content/50'}`}
              >
                {t('profile.stats.artworks')}
                {activeTab === 'artworks' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'orders' ? 'text-primary-600' : 'text-base-content/50'}`}
              >
                {t('profile.actions.purchases')}
                {activeTab === 'orders' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'activity' && (
                <div className="bg-base-100 rounded-2xl border border-base-300 p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                      >
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm text-base-content">{activity.text}</p>
                          <p className="text-xs text-base-content/50">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'artworks' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myArtworks.length > 0 ? (
                    myArtworks.map((artwork) => (
                      <div key={artwork._id} className="bg-base-100 rounded-xl overflow-hidden border border-base-300 group">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={artwork.photo?.startsWith('http') ? artwork.photo : `${apiClient.defaults.baseURL}${artwork.photo}`}
                            alt={artwork.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-base-content">{artwork.title}</h4>
                          <p className="text-primary-600 font-bold">${artwork.price}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 text-base-content/50 italic">
                      No artworks uploaded yet.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {myOrders.length > 0 ? (
                    myOrders.map((order) => (
                      <div key={order._id} className="flex items-center gap-4 bg-base-100 p-4 rounded-xl border border-base-300">
                        <img
                          src={order.product?.photo?.startsWith('http') ? order.product.photo : `${apiClient.defaults.baseURL}${order.product?.photo}`}
                          alt={order.product?.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-base-content">{order.product?.title}</h4>
                          <p className="text-xs text-base-content/50">Bought from {order.seller?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600">${order.amount}</p>
                          <p className="text-[10px] uppercase font-bold text-success-600">{order.paymentStatus}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-base-content/50 italic">
                      You haven't purchased anything yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-base-100 rounded-2xl border border-base-300 p-6">
              <h3 className="text-xl font-semibold text-base-content mb-4">
                {t('profile.quick')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowUploadProductModal(true)}
                  className="p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-base-content">{t('upload_artwork.title') || 'New Artwork'}</div>
                      <div className="text-sm text-base-content/70">Upload your work</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setShowPostModal(true)}
                  className="p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Edit3 className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-base-content">{t('post_creator.title') || 'New Post'}</div>
                      <div className="text-sm text-base-content/70">Share your journey</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <div className="font-medium text-base-content">{t('profile.actions.purchases')}</div>
                      <div className="text-sm text-base-content/70">{t('profile.actions.purchases_desc')}</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/learn')}
                  className="p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-info-600" />
                    </div>
                    <div>
                      <div className="font-medium text-base-content">{t('profile.actions.courses')}</div>
                      <div className="text-sm text-base-content/70">{t('profile.actions.courses_desc')}</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/community')}
                  className="p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <div className="font-medium text-base-content">{t('profile.actions.communities')}</div>
                      <div className="text-sm text-base-content/70">{t('profile.actions.communities_desc')}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-base-100 rounded-2xl border border-base-300 p-6">
              <h3 className="text-xl font-semibold text-base-content mb-4">
                {t('profile.settings.title')}
              </h3>
              <div className="space-y-4">
                <button className="w-full p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-base-content/70" />
                      <div>
                        <div className="font-medium text-base-content">{t('profile.settings.notifications')}</div>
                        <div className="text-sm text-base-content/70">{t('profile.settings.notifications_desc')}</div>
                      </div>
                    </div>
                    <Settings className="w-5 h-5 text-base-content/50" />
                  </div>
                </button>

                <button className="w-full p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-base-content/70" />
                      <div>
                        <div className="font-medium text-base-content">{t('profile.settings.privacy')}</div>
                        <div className="text-sm text-base-content/70">{t('profile.settings.privacy_desc')}</div>
                      </div>
                    </div>
                    <Settings className="w-5 h-5 text-base-content/50" />
                  </div>
                </button>

                <button className="w-full p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-base-content/70" />
                      <div>
                        <div className="font-medium text-base-content">{t('profile.settings.language')}</div>
                        <div className="text-sm text-base-content/70">{t('profile.settings.language_desc')}</div>
                      </div>
                    </div>
                    <Settings className="w-5 h-5 text-base-content/50" />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <PostCreator open={showPostModal} onClose={() => setShowPostModal(false)} />
      <UploadProduct open={showUploadProductModal} onClose={() => setShowUploadProductModal(false)} />
    </div>
  )
}

export default Profile
