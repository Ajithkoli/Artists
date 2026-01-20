import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

const Cart = () => {
    const { t } = useTranslation();
    const { cart, removeFromCart, clearCart, cartTotal } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Helper to load Razorpay SDK dynamically
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast.error(t('view_post.comment_login') || "Please login to checkout");
            return;
        }

        setLoading(true);

        try {
            // 1. Load Razorpay SDK
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setLoading(false);
                return;
            }

            // 2. Create Order on Backend
            const { data: { order } } = await apiClient.post("/payment/process-cart",
                { items: cart },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // 3. Get Key ID
            const { data: { key } } = await apiClient.get("/payment/razorpaykey");

            // 4. Configure Razorpay Options
            const options = {
                key: key,
                amount: order.amount,
                currency: "INR",
                name: "Crafto",
                description: `Payment for ${cart.length} items`,
                image: "https://via.placeholder.com/150",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 5. Verify Payment on Backend
                        const verifyUrl = "/payment/verify-cart";
                        await apiClient.post(verifyUrl, {
                            items: cart,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });

                        toast.success("Payment Successful! Orders placed.");
                        clearCart();
                        navigate('/profile'); // Redirect to profile to see orders

                    } catch (error) {
                        console.error("Payment verification failed", error);
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: ""
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(response.error.description || "Payment Failed");
            });
            rzp.open();

        } catch (error) {
            console.error("Checkout error:", error);
            const msg = error.response?.data?.message || "Could not initiate checkout.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

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
                                <div className="text-primary-600 font-bold">₹{item.price}</div>
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
                            <span>₹{cartTotal}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-gray-600 dark:text-gray-300">
                            <span>{t('cart.taxes')}</span>
                            <span>₹0.00</span>
                        </div>
                        <div className="border-t pt-4 mb-6 flex justify-between font-bold text-lg">
                            <span>{t('cart.total')}</span>
                            <span>₹{cartTotal}</span>
                        </div>

                        <button
                            className="btn btn-primary w-full"
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-xs mr-2"></span>
                                    {t('cart.processing') || "Processing..."}
                                </>
                            ) : t('cart.checkout')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
