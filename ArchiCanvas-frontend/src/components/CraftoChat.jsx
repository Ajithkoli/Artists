// File: src/components/CraftoChat.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import apiClient from '../api/axios';

// This component now calls the server-side AI proxy at `/api/v1/ai/chat`.

const CraftoChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState(null);

    // This function initializes the chat with the system prompt
    const initializeChat = () => {
        // Local system prompt is kept in frontend but the server-side model can also apply its own prompt.
        const greeting = 'Hello! I am Crafto, your guide to the Crafto platform. How can I help you explore the world of traditional art today?';
        setMessages([{ role: 'model', text: greeting }]);
        return null; // chat state not needed when using server proxy
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentChat = chat || initializeChat();
        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setInput('');

        try {
            // Call server-side AI proxy. Backend will add GEMINI_API_KEY server-side.
            const resp = await apiClient.post('/ai/chat', { message: input });
            const text = resp?.data?.text || 'Sorry, I could not get a response.';
            setMessages(prev => [...prev, { role: 'model', text }]);
        } catch (error) {
            console.error('AI proxy error:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I seem to be having some trouble right now. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-base-100 rounded-xl shadow-lg border border-base-300 dark:border-slate-700 overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
            <div className="p-4 border-b dark:border-slate-700">
                <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white">Chat with Crafto</h2>
            </div>

            <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                        >
                            {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white"><Bot size={20} /></div>}
                            <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                                <div className="flex items-center gap-2">
                                    {msg.role === 'user' && <MessageCircle className="w-4 h-4 mr-1 text-white" />}
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                </div>
                            </div>
                            {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center text-white"><User size={20} /></div>}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && <div className="flex justify-start"><span className="loading loading-dots loading-md text-slate-500"></span></div>}
                {isLoading && (
                    <div className="flex justify-end items-center gap-2 mt-2">
                        <MessageCircle className="w-5 h-5 animate-spin text-blue-500" />
                        <span className="text-blue-500">Sending...</span>
                    </div>
                )}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t dark:border-slate-700 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Crafto..."
                    className="input input-bordered w-full"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            sendMessage(e);
                        }
                    }}
                />

                <button
                    type="submit"
                    className="btn btn-primary btn-square flex items-center justify-center"
                    disabled={isLoading || input.trim() === ''}
                >
                    <motion.div
                        animate={{ rotate: isLoading ? 360 : 0 }}
                        transition={{ repeat: isLoading ? Infinity : 0, duration: 1, ease: 'linear' }}
                    >
                        <Send size={20} />
                    </motion.div>
                </button>
            </form>

        </div>
    );
};

export default CraftoChat;