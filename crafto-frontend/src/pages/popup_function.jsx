import React, { useState } from 'react';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// --- Main Buy Button Component with Razorpay Logic ---
const Bynow = ({ selectedProduct }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

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

    const handleBuyNow = async () => {
        if (!user) {
            toast.error("You must be logged in to purchase.");
            return;
        }

        if (selectedProduct?.user?._id === user._id) {
            toast.error("You cannot buy your own artwork.");
            return;
        }

        setLoading(true);

        try {
            console.log("Selected Product for BuyNow:", selectedProduct);
            // 1. Load Razorpay SDK
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setLoading(false);
                return;
            }

            // 2. Create Order on Backend
            const { data: { order, product } } = await apiClient.post("/payment/process",
                { productId: selectedProduct._id },
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
                description: `Purchase: ${product.title}`,
                image: "https://via.placeholder.com/150",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 5. Verify Payment on Backend
                        const verifyUrl = "/payment/order";
                        const { data } = await apiClient.post(verifyUrl, {
                            productId: selectedProduct._id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });

                        toast.success("Payment Successful! Order placed.");
                        console.log("Order Success:", data);

                    } catch (error) {
                        console.error("Payment verification failed", error);
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: ""
                },
                notes: {
                    address: "Crafto Corporate Office"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            // 5. Open Razorpay Modal
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                toast.error(response.error.description || "Payment Failed");
            });
            rzp1.open();

        } catch (error) {
            console.error("Purchase error:", error);
            const msg = error.response?.data?.message || "Could not initiate payment.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                className="btn btn-primary w-full shadow-lg hover:shadow-xl transition-all"
                onClick={handleBuyNow}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="loading loading-spinner loading-xs mr-2"></span>
                        Processing...
                    </>
                ) : "Buy Now"}
            </button>
        </div>
    );
};

export default Bynow;