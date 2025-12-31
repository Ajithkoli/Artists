import React from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Bynow from '../pages/popup_function';

const ProductCard = ({ product, onAddToCart }) => {
    // Generate some mock stats if missing from real data to match the design (fallback)
    const rating = product.rating || (4.0 + Math.random()).toFixed(1);
    const views = product.views || Math.floor(Math.random() * 1000) + 100;
    const likes = product.likes || Math.floor(Math.random() * 200) + 20;
    const category = product.category || "Art";

    return (
        <div className="bg-base-100 rounded-xl overflow-hidden shadow-lg card-hover transition-transform duration-300 hover:-translate-y-2 group h-full flex flex-col">
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={product.photo?.startsWith('http') ? product.photo : `${import.meta.env.VITE_API_BASE_URL}/watermark${product.photo}`}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Favorite Button (Mock) */}
                <div className="absolute top-4 right-4">
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                        <Heart className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-6 flex flex-col flex-grow">
                {/* Category and Rating */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary-600 font-medium">
                        {category}
                    </span>
                    <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{rating}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg text-base-content mb-2 line-clamp-1">
                    {product.title}
                </h3>

                {/* Artist */}
                <p className="text-sm text-base-content/70 mb-4">
                    by {product.user?.name || 'Unknown Artist'}
                </p>

                {/* Price and Stats */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                        ${product.price}
                    </span>
                    <div className="flex items-center space-x-4 text-sm text-base-content/70">
                        <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{likes}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto space-y-2">
                    {/* View Details Button - SOLID PRIMARY WITH WHITE TEXT */}
                    <Link
                        to={`/product/${product._id}`}
                        className="btn btn-primary btn-sm w-full flex items-center justify-center gap-2 text-white"
                    >
                        View Details
                    </Link>

                    {/* Add to Cart & Buy Now Row */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAddToCart(product)}
                            className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={16} />
                            Add
                        </button>

                        <div className="flex-1">
                            <div className="[&>div>button]:btn-sm [&>div>button]:h-full">
                                <Bynow selectedProduct={product} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
