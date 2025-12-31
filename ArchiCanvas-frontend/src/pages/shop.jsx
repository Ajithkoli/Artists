import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/products`;

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const { addToCart, cart } = useCart();
    const { user } = useAuth(); // kept for potential future use

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL, { withCredentials: true });
            setProducts(response?.data?.products || []);
        } catch (error) {
            toast.error("Failed to load products.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
                    Art Marketplace
                </h1>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-grow md:flex-grow-0 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search artworks..."
                            className="input input-bordered w-full pl-10 bg-white dark:bg-gray-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Cart Button */}
                    {/* Cart Button */}
                    <Link to="/cart" className="btn btn-ghost relative">
                        <ShoppingBag size={24} />
                        {cart.length > 0 && (
                            <span className="badge badge-primary badge-sm absolute -top-1 -right-1">
                                {cart.length}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl">No artworks found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default Shop;
