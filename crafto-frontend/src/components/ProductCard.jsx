import React from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Bynow from '../pages/popup_function';

const ProductCard = ({ product, onAddToCart }) => {
    // Generate some mock stats if missing from real data to match the design (fallback)
    const rating = product.rating || 4.5;
    const views = product.views || 0;
    const likes = product.likes?.length || 0;
    const category = product.category || product.tags?.[0] || "Art";

    return (
        <div className="card-premium overflow-hidden group h-full flex flex-col p-1">
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden rounded-xl">
                <img
                    src={product.photo?.startsWith('http') ? product.photo : `${import.meta.env.VITE_API_BASE_URL}/watermark${product.photo}`}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-base-100/20 backdrop-blur-md rounded-full border border-base-content/20">
                    <span className="text-[10px] font-bold text-base-content tracking-widest uppercase">
                        {category}
                    </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 bg-base-100/40 backdrop-blur-md rounded-lg border border-base-content/10">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-bold text-base-content">{rating}</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Title and Artist */}
                <div className="mb-4">
                    <h3 className="font-bold text-xl text-base-content mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {product.title}
                    </h3>
                    <p className="text-xs text-base-content/50 uppercase tracking-widest font-medium">
                        by {product.user?.name || 'Unknown Artist'}
                    </p>
                </div>

                {/* Price and Stats */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                        <span className="text-xs text-base-content/50 font-medium">Current Price</span>
                        <span className="text-2xl font-black text-base-content uppercase tracking-tighter">
                            ${product.price}
                        </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-base-content/60">
                        <div className="flex flex-col items-center">
                            <Eye className="w-4 h-4 mb-0.5" />
                            <span>{views}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Heart className="w-4 h-4 mb-0.5" />
                            <span>{likes}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link
                        to={`/product/${product._id}`}
                        className="btn-outline !py-2.5 !px-3 text-xs w-full flex items-center justify-center gap-2"
                    >
                        Details
                    </Link>

                    <button
                        onClick={() => onAddToCart(product)}
                        className="btn-primary !py-2.5 !px-3 text-xs flex-1 flex items-center justify-center gap-2"
                    >
                        <ShoppingCart size={14} />
                        Add
                    </button>

                    <div className="col-span-2 mt-2">
                        <Bynow selectedProduct={product} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
