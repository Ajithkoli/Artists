import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useCart } from "../../contexts/CartContext";
import UploadProduct from "../UploadProduct";

import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  Home,
  Search,
  Users,
  Info,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  ShoppingBag,
  Bot,
} from "lucide-react";
import PostCreator from "../PostCreator";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const [showPostModal, setShowPostModal] = useState(false);
  const [showUploadProductModal, setShowUploadProductModal] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { cart } = useCart();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'kn' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navigation = [
    { name: t('navbar.home'), href: "/", icon: Home },
    { name: t('navbar.explore'), href: "/explore", icon: Search },
    { name: t('navbar.community'), href: "/community", icon: Users },
    { name: t('navbar.dashboard'), href: "/shop", icon: ShoppingBag }, // Adjusted key based on translation file or use shop
    { name: t('navbar.about'), href: "/about", icon: Info },
    { name: "CraftoChat", href: "/ai-chat", icon: Bot },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-content/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">C</span>
                </div>
                <span className="text-2xl font-serif font-bold text-gradient tracking-tight">
                  Crafto
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(item.href)
                    ? "text-primary-600 bg-primary-500/10 shadow-inner"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-content/5"
                    }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive(item.href) ? "text-primary-400" : ""}`} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Cart Link */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl bg-base-content/5 hover:bg-base-content/10 border border-base-content/5 transition-all duration-300 group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:text-primary-400 transition-colors" />
                {cart?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                    {cart.length}
                  </span>
                )}
              </Link>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2.5 rounded-xl bg-base-content/5 hover:bg-base-content/10 border border-base-content/5 transition-all duration-300 group flex items-center gap-2"
                aria-label="Toggle language"
              >
                <Globe className="w-5 h-5 group-hover:text-primary-400 transition-colors" />
                <span className="text-xs font-bold">{i18n.language?.toUpperCase()}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-base-content/5 hover:bg-base-content/10 border border-base-content/5 transition-all duration-300 group"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
                ) : (
                  <Moon className="w-5 h-5 group-hover:text-primary-400 transition-colors" />
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl bg-base-content/5 hover:bg-base-content/10 border border-base-content/5 transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        src={
                          user.avatar
                            ? user.avatar
                            : user.role === "admin"
                              ? "https://cdn-icons-png.flaticon.com/512/1828/1828640.png"
                              : user.role === "artist"
                                ? "https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
                                : "https://cdn-icons-png.flaticon.com/512/1077/1077012.png"
                        }
                        alt={user.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
                    </div>
                    <span className="hidden lg:block text-sm font-medium">
                      {user.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 py-3 overflow-hidden"
                      >
                        <div className="px-5 py-3 border-b border-base-content/5 bg-base-content/5">
                          <p className="text-sm font-bold text-base-content tracking-tight">{user.name}</p>
                          <p className="text-xs text-base-content/60 mt-0.5 truncate">
                            {user.email}
                          </p>
                        </div>

                        <div className="p-2 space-y-1">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <User className="w-4 h-4 text-primary-400" />
                            <span>Profile View</span>
                          </Link>

                          {(user.role === "artist" || user.role === "admin") && (
                            <>
                              <button
                                className="flex items-center space-x-3 px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 transition-colors w-full text-left"
                                onClick={() => {
                                  setShowPostModal(true);
                                  setIsProfileOpen(false);
                                }}
                              >
                                <Plus className="w-4 h-4 text-secondary-400" />
                                <span>Create New Post</span>
                              </button>
                              <button
                                className="flex items-center space-x-3 px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 transition-colors w-full text-left"
                                onClick={() => {
                                  setShowUploadProductModal(true);
                                  setIsProfileOpen(false);
                                }}
                              >
                                <Plus className="w-4 h-4 text-accent" />
                                <span>Upload Artwork</span>
                              </button>
                            </>
                          )}

                          {user.role === "admin" && (
                            <Link
                              to="/admin-dashboard"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-warning" />
                              <span>System Admin</span>
                            </Link>
                          )}

                          <div className="pt-2 mt-2 border-t border-white/5">
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 px-4 py-2.5 text-sm rounded-xl hover:bg-error/10 text-error transition-colors w-full text-left"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-bold border border-base-content/10 hover:bg-base-content/5 transition-all">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm px-6 py-2.5">
                    Join Crafto
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-base-300 bg-base-100"
            >
              <div className="px-4 py-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive(item.href)
                      ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "text-base-content hover:text-primary-600 hover:bg-base-200"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Modals outside sticky/blurred container */}
      {isAuthenticated && (user.role === "artist" || user.role === "admin") && (
        <>
          <PostCreator
            open={showPostModal}
            onClose={() => setShowPostModal(false)}
            onSubmit={(postData) => {
              setShowPostModal(false);
            }}
          />
          {showUploadProductModal && (
            <UploadProduct
              open={showUploadProductModal}
              onClose={() => setShowUploadProductModal(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export default Navbar;
