import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // We'll use this to get the user role
import CreateCommunity from '../components/createcommunity';
import apiClient from '../api/axios'; // Centralized axios instance
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Use relative path against apiClient base URL (handles fallback + credentials)
const API_URL = `/communities`;

const Community = () => {
    const { t } = useTranslation()
    const [communities, setCommunities] = useState([]); // State to hold communities from the backend
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { user } = useAuth(); // Get user from your AuthContext
    const navigate = useNavigate();

    // --- Fetch communities from the backend ---
    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                setLoading(true);
                // The auth token is sent automatically by the axios config in your AuthContext
                const response = await apiClient.get(API_URL, {
                    params: { search: searchTerm }
                });
                const list = response?.data?.data?.communities;
                if (Array.isArray(list)) {
                    setCommunities(list);
                } else {
                    console.warn('Unexpected communities response shape:', response.data);
                    setCommunities([]);
                }
            } catch (error) {
                toast.error('Failed to fetch communities.');
                console.error("Fetch communities error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
        const interval = setInterval(() => {
            fetchCommunities();
        }, 50000); // 50 seconds
        return () => clearInterval(interval);
    }, [searchTerm]); // Re-fetch when searchTerm changes and every 50s

    // The 'filteredCommunities' logic is now handled by the backend search
    const displayedCommunities = communities;

    return (
        <div className="min-h-screen bg-base-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-serif font-bold text-base-content mb-4">
                        {t('community.title')}
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
                        className="text-xl text-base-content/70 max-w-2xl mx-auto">
                        {t('community.subtitle')}
                    </motion.p>

                    {/* Create Community Button for artists */}
                    {user?.role === 'artist' && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="btn-primary mt-6 flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{t('community.create_btn')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Community Form Modal */}
            {showCreateForm && <CreateCommunity onClose={() => setShowCreateForm(false)} />}

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
                        <input
                            type="text"
                            placeholder={t('community.search_placeholder')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Communities Grid */}
                {loading ? (
                    <div className="text-center">{t('community.loading')}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {displayedCommunities.length === 0 ? (
                            <div className="col-span-3 text-center text-base-content/70 py-12">{t('community.no_results')}</div>
                        ) : (
                            displayedCommunities.map(comm => (
                                <div key={comm._id} className="bg-base-200 rounded-xl shadow-lg p-6 flex flex-col">
                                    <h2 className="text-xl font-bold mb-2">{comm.name}</h2>
                                    <p className="mb-4 text-base-content/70 flex-grow">{comm.description}</p>
                                    <div className="mb-4 text-base-content/60">{t('community.members')}: {comm.memberCount}</div>
                                    <button
                                        className="btn-primary mt-auto"
                                        onClick={() => navigate(`/community/${comm._id}`)}
                                    >
                                        {t('community.view_btn')}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;