import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { motion } from 'framer-motion';

const CheckoutForm = ({ product, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) return;

        try {
            // 1. Create PaymentIntent on server
            const config = {
                headers: { "Content-Type": "application/json" }
            };
            const { data: { client_secret } } = await apiClient.post(
                "/payment/process",
                { productId: product._id },
                config
            );

            // 2. Confirm Card Payment
            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                    billing_details: {
                        name: user.name,
                        email: user.email,
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
                setProcessing(false);
            } else {
                if (result.paymentIntent.status === "succeeded") {
                    // 3. Create Order on server
                    await apiClient.post("/payment/order", {
                        productId: product._id,
                        paymentIntentId: result.paymentIntent.id
                    });

                    onSuccess();
                }
            }

        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setProcessing(false);
        }
    };

    const inputStyle = "p-3 border border-gray-300 rounded-lg dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 transition-all";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Product:</span>
                    <span className="font-semibold">{product.title}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-600 dark:text-gray-300">Total:</span>
                    <span className="text-primary-600">₹{product.price}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                <div className={inputStyle}>
                    <CardNumberElement options={{ style: { base: { fontSize: '16px' } } }} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiration Date</label>
                    <div className={inputStyle}>
                        <CardExpiryElement options={{ style: { base: { fontSize: '16px' } } }} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVC</label>
                    <div className={inputStyle}>
                        <CardCvcElement options={{ style: { base: { fontSize: '16px' } } }} />
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <div className="flex gap-4 mt-8">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={processing || !stripe}
                    className="flex-1 py-3 px-4 bg-primary-600 border border-transparent rounded-lg text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg disabled:opacity-50 flex items-center justify-center"
                >
                    {processing ? (
                        <>
                            <span className="loading loading-spinner loading-sm mr-2"></span>
                            Processing...
                        </>
                    ) : (
                        `Pay ₹${product.price}`
                    )}
                </button>
            </div>
        </form>
    );
};

export default CheckoutForm;
