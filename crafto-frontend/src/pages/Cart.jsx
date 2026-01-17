import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Bynow from './popup_function';
import { useTranslation } from 'react-i18next';

const Cart = () => {
    const { t } = useTranslation();
    const { cart, removeFromCart, clearCart, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-4">{t('cart.empty_title')}</h2>
                <p className="text-gray-500 mb-8">{t('cart.empty_desc')}</p>
                <Link to="/shop" className="btn btn-primary">
                    <ArrowLeft size={18} className="mr-2" />
                    {t('cart.go_shop')}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-serif">{t('cart.title')} ({cart.length})</h1>
                <Link to="/shop" className="btn btn-ghost btn-sm">
                    {t('cart.continue')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div key={item._id} className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <img
                                src={item.photo?.startsWith('http') ? item.photo : `${import.meta.env.VITE_API_BASE_URL}/watermark${item.photo}`}
                                alt={item.title}
                                className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">{t('cart.by_artist', { artist: item.user?.name || 'Artist' })}</p>
                                <div className="text-primary-600 font-bold">${item.price}</div>
                            </div>
                            <button
                                onClick={() => removeFromCart(item._id)}
                                className="text-red-500 hover:text-red-700 p-2"
                                title={t('cart.remove')}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}

                    {cart.length > 0 && (
                        <button onClick={clearCart} className="text-red-500 text-sm hover:underline mt-4">
                            {t('cart.clear')}
                        </button>
                    )}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 sticky top-24">
                        <h2 className="text-xl font-bold mb-4">{t('cart.summary')}</h2>
                        <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-300">
                            <span>{t('cart.subtotal')}</span>
                            <span>${cartTotal}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-gray-600 dark:text-gray-300">
                            <span>{t('cart.taxes')}</span>
                            <span>$0.00</span>
                        </div>
                        <div className="border-t pt-4 mb-6 flex justify-between font-bold text-lg">
                            <span>{t('cart.total')}</span>
                            <span>${cartTotal}</span>
                        </div>

                        {/* 
                            Note: The current 'Bynow' (Razorpay) component only handles SINGLE products based on ID.
                            For now, since we haven't refactored the backend to accept 'Cart Orders',
                            we will prompt the user that Bulk Checkout is coming soon, or we can iterate.
                            
                            Temporary Limit: Cart Checkout not fully supported by backend payment controller (single product expected).
                            We will just show a button that says "Checkout" and maybe alerts.
                            
                            Actually, let's just reuse Bynow for the FIRST item if there is only one, 
                            or disable it if multiple for this MVP step.
                        */}
                        <button className="btn btn-primary w-full" disabled>
                            {t('cart.checkout')}
                        </button>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            {t('cart.limit_note')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
