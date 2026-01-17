// File: src/pages/Badges.jsx

import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import apiClient from '../api/axios';
import { useAuth } from '../contexts/AuthContext'; // Assuming you use this
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/users/my-badges`;

const Badges = () => {
    const { t } = useTranslation();
    const [productCount, setProductCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Get the logged-in user

    // Define the 4 innovative badges
    const allBadges = [
        {
            name: t('badges.names.innovator'),
            color: "yellow-500",
            description: t('badges.descriptions.innovator')
        },
        {
            name: t('badges.names.trendsetter'),
            color: "blue-500",
            description: t('badges.descriptions.trendsetter')
        },
        {
            name: t('badges.names.visionary'),
            color: "purple-500",
            description: t('badges.descriptions.visionary')
        },
        {
            name: t('badges.names.master'),
            color: "green-500",
            description: t('badges.descriptions.master')
        }
    ];

    useEffect(() => {
        const fetchBadges = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                // The auth token is sent automatically by your axios setup in AuthContext
                const response = await apiClient.get('/badges');
                setProductCount(response.data.productCount);
            } catch (error) {
                toast.error(t('badges.fetch_error'));
                console.error("Fetch badges error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBadges();
    }, [user]);

    // Determine earned badges based on productCount
    const earnedBadges = [];
    if (productCount >= 3) earnedBadges.push({ ...allBadges[0], earnedAt: t('badges.earned_after', { count: 3 }) });
    if (productCount >= 5) earnedBadges.push({ ...allBadges[1], earnedAt: t('badges.earned_after', { count: 5 }) });
    if (productCount >= 10) earnedBadges.push({ ...allBadges[2], earnedAt: t('badges.earned_after', { count: 10 }) });
    if (productCount >= 20) earnedBadges.push({ ...allBadges[3], earnedAt: t('badges.earned_after', { count: 20 }) });

    if (loading) {
        return <div className="text-center p-12">{t('badges.loading')}</div>;
    }

    if (!user) {
        return <div className="text-center p-12">{t('badges.login_required')}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto mt-10 px-4">
            <h1 className="text-3xl font-bold text-center mb-2">{t('badges.title')} ({earnedBadges.length})</h1>
            <p className="text-center text-gray-500 mb-8">{t('badges.subtitle', { count: productCount })}</p>

            {earnedBadges.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl">
                    <h2 className="text-xl font-semibold">{t('badges.no_badges')}</h2>
                    <p className="text-gray-600 mt-2">{t('badges.no_badges_desc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {earnedBadges.map((badge, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center bg-white p-6 rounded-xl shadow-lg transition-transform hover:scale-105"
                        >
                            <Award className={`w-12 h-12 text-${badge.color} mb-3`} />
                            <h2 className="text-xl font-semibold">{badge.name}</h2>
                            <p className="text-gray-500 text-center mt-1">{badge.description}</p>
                            <p className="text-gray-500 text-center mt-1">
                                {badge.earnedAt}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Badges;