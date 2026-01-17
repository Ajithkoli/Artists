import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    Menu, Home, Clock, Users, Palette, Package, Check, X, BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin`;

// --- Reusable Components (placed in the same file for simplicity) ---

const Sidebar = ({ isOpen }) => {
    const { t } = useTranslation();
    const menuItems = [
        { icon: Home, label: t('admin.sidebar.dashboard'), active: true },
        { icon: Clock, label: t('admin.sidebar.pending') },
        { icon: Palette, label: t('admin.sidebar.listings') },
    ];
    return (
        <div className={`fixed left-0 top-0 h-full bg-gray-900/90 backdrop-blur-lg border-r border-gray-700/50 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-16'}`}>
            <div className="p-4 border-b border-gray-700/50 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                </div>
                {isOpen && <span className="text-white font-bold text-lg">{t('admin.sidebar.title')}</span>}
            </div>
            <nav className="mt-6">
                {menuItems.map((item, index) => (
                    <div key={index} className={`flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 cursor-pointer transition-all ${item.active ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-r-2 border-blue-500 text-white' : ''}`}>
                        <item.icon className="w-5 h-5" />
                        {isOpen && <span>{item.label}</span>}
                    </div>
                ))}
            </nav>
        </div>
    );
};

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800/50 rounded-lg transition-all">
                    <Menu className="w-5 h-5 text-gray-300" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        {/* <User className="w-4 h-4 text-white" /> */}
                    </div>
                    <span className="text-white font-medium">{t('admin.topbar.admin_label')}</span>
                </div>
            </div>
        </div>
    )
};

const StatsCards = ({ stats }) => {
    const { t } = useTranslation();
    const statsData = [
        { label: t('admin.stats.buyers'), value: stats?.totalBuyers ?? '0', icon: Users },
        { label: t('admin.stats.artists'), value: stats?.totalArtists ?? '0', icon: Palette },
        { label: t('admin.stats.products'), value: stats?.totalProducts ?? '0', icon: Package },
        { label: t('admin.stats.communities'), value: stats?.totalCommunities ?? '0', icon: Users },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
                <div key={index} className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                        <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

const PendingRequests = () => {
    const { t } = useTranslation();
    const [communityRequests, setCommunityRequests] = useState([]);
    const [artistRequests, setArtistRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [artistsRes, communitiesRes] = await Promise.all([
                apiClient.get(`/admin/artists/pending`, { withCredentials: true }),
                apiClient.get(`/admin/communities/pending`, { withCredentials: true })
            ]);
            setArtistRequests(artistsRes.data.artists);
            setCommunityRequests(communitiesRes.data.communities);
        } catch (error) {
            toast.error("Failed to fetch pending requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (type, id, action) => {
        try {
            await apiClient.patch(`/admin/${type}/${id}/${action}`, { withCredentials: true });
            toast.success(t('admin.requests.success', { action: action }));
            fetchData(); // Refresh the lists
        } catch {
            toast.error(t('admin.requests.fail', { action: action }));
        }
    };

    if (loading) return <div className="text-center text-gray-400 col-span-full">{t('admin.requests.loading')}</div>;

    const RequestCard = ({ requests, type, title, icon: Icon }) => (
        <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
                <Icon className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">{requests.length}</span>
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto">
                {requests.length > 0 ? requests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                        <div>
                            <p className="text-white font-medium">{req.name}</p>
                            <p className="text-gray-400 text-sm">{type === 'artists' ? req.email : `${t('admin.requests.by')} ${req.creator?.name}`}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleAction(type, req._id, 'approve')} className="btn btn-xs btn-success">{t('admin.requests.approve')}</button>
                            <button onClick={() => handleAction(type, req._id, 'reject')} className="btn btn-xs btn-error">{t('admin.requests.reject')}</button>
                        </div>
                    </div>
                )) : <p className="text-gray-400">{t('admin.requests.no_pending')}</p>}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RequestCard requests={communityRequests} type="communities" title={t('admin.requests.community')} icon={Users} />
            <RequestCard requests={artistRequests} type="artists" title={t('admin.requests.artist')} icon={Palette} />
        </div>
    );
};

const AnalyticsCharts = ({ analytics, stats }) => {
    const { t } = useTranslation();
    const buyerSellerData = [
        { name: t('admin.charts.buyers'), value: stats?.totalBuyers ?? 0 },
        { name: t('admin.charts.artists'), value: stats?.totalArtists ?? 0 }
    ];
    const COLORS = ['#3b82f6', '#ec4899', '#84cc16', '#f97316'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Communities Chart */}
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.charts.top_communities')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.topCommunities} layout="vertical" margin={{ left: 50 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={100} tick={{ fill: '#9CA3AF' }} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                        <Bar dataKey="memberCount" fill="#3b82f6" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Messages Over Time Chart */}
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.charts.messages')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.messagesOverTime}>
                        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                        <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                        <Line type="monotone" dataKey="count" stroke="#84cc16" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Buyer vs Artist Pie Chart */}
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.charts.ratio')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={buyerSellerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            <Cell fill="#3b82f6" />
                            <Cell fill="#ec4899" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Art by Category Pie Chart */}
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.charts.categories')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={analytics?.artworkByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {analytics?.artworkByCategory?.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
const ArtAdminDashboard = () => {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAllData = async () => {
            if (user?.role !== 'admin') {
                setLoading(false);
                return;
            }
            try {
                const [statsRes, analyticsRes] = await Promise.all([
                    apiClient.get('/admin/stats', { withCredentials: true }),
                    apiClient.get('/admin/analytics', { withCredentials: true })
                ]);
                setStats(statsRes.data.stats);
                setAnalytics(analyticsRes.data.analytics);
            } catch (error) {
                toast.error("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [user]);

    if (loading) return <div className="text-white text-center p-20">{t('admin.overview.loading')}</div>;
    if (user?.role !== 'admin') return <div className="text-red-500 text-center p-20">{t('admin.overview.denied')}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Sidebar isOpen={sidebarOpen} />
            <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
                <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">{t('admin.overview.title')}</h1>
                        <p className="text-gray-400">{t('admin.overview.subtitle')}</p>
                    </div>
                    <StatsCards stats={stats} />
                    <PendingRequests />
                    <AnalyticsCharts analytics={analytics} stats={stats} />
                </main>
            </div>
        </div>
    );
};

export default ArtAdminDashboard;