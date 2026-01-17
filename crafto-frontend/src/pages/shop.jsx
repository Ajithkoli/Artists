import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = `/products`;

const Shop = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const { addToCart, cart } = useCart();
    const { user } = useAuth(); // kept for potential future use

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_URL);
            setProducts(response?.data?.products || []);
        } catch (error) {
            toast.error(t('shop.load_fail'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        const search = searchTerm.toLowerCase();
        return (
            p.title?.toLowerCase().includes(search) ||
            p.description?.toLowerCase().includes(search) ||
            p.origin?.toLowerCase().includes(search) ||
            p.user?.name?.toLowerCase().includes(search) ||
            p.tags?.some(tag => tag.toLowerCase().includes(search))
        );
    });

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen relative z-10">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                <div>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-base-content mb-2 tracking-tighter">
                        {t('shop.title')} <span className="text-primary-600">{t('shop.marketplace')}</span>
                    </h1>
                    <p className="text-base-content/50 font-medium">{t('shop.subtitle')}</p>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-grow md:flex-grow-0 md:w-96 group">
                        <div className="absolute inset-0 bg-primary-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder={t('shop.search_placeholder')}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-base-100 border border-base-content/10 focus:border-primary-500/50 outline-none transition-all placeholder:text-base-content/30 text-base-content font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 rounded-[40px] border-2 border-dashed border-base-content/5 bg-base-content/5">
                    <p className="text-2xl font-bold text-base-content mb-2">{t('shop.no_finds')}</p>
                    <p className="text-base-content/50">{t('shop.no_finds_desc')}</p>
                </div>
            )}
        </div>
    );
};

export default Shop;
