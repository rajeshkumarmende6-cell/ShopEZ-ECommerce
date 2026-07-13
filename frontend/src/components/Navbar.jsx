import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import useCart from '../hooks/useCart';
import useWishlist from '../hooks/useWishlist';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist.products?.length || 0;

  // Sync search keyword from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kw = params.get('keyword');
    if (kw) {
      setKeyword(kw);
    } else {
      setKeyword('');
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/products');
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800 transition duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-1.5 select-none">
              ShopEZ
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl py-2.5 pl-4 pr-11 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition"
              />
              <button
                type="submit"
                className="search-submit-btn absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/products" className="text-sm font-semibold text-slate-300 hover:text-slate-100 transition">
              Shop
            </Link>
            <Link to="/products?isFeatured=true" className="text-sm font-semibold text-slate-300 hover:text-slate-100 transition">
              Featured
            </Link>
          </nav>

          {/* Action Icons & Utilities */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-800 border border-slate-700/50 transition cursor-pointer"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-800 border border-slate-700/50 transition"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-slate-900">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-800 border border-slate-700/50 transition"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-violet-500 text-white dark:text-slate-950 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-slate-900 dark:border-slate-950">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1 bg-slate-800 border border-slate-700/50 py-1.5 px-3 rounded-lg text-slate-300 hover:text-slate-100 text-sm font-semibold transition cursor-pointer"
                  >
                    <User size={16} />
                    <span className="hidden sm:inline truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`transition duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50 text-slate-300 text-sm">
                      <div className="px-4 py-2 border-b border-slate-700/50">
                        <p className="text-slate-200 font-bold truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-slate-700 hover:text-slate-100 transition"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-slate-700 hover:text-slate-100 transition"
                      >
                        Order History
                      </Link>
                      
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 hover:bg-violet-900/30 hover:text-violet-300 border-t border-slate-700/50 transition font-bold"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-red-950/20 hover:text-red-400 border-t border-slate-700/50 flex items-center gap-1.5 transition cursor-pointer font-medium"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl transition duration-200 shadow-md shadow-violet-950/20"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-4 transition duration-300">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-4 pr-10 text-sm text-slate-100 focus:outline-none"
            />
            <button type="submit" className="search-submit-btn absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
              <Search size={16} />
            </button>
          </form>

          <div className="flex flex-col space-y-3 pl-1 pb-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-slate-100 transition"
            >
              Shop All
            </Link>
            <Link
              to="/products?isFeatured=true"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-slate-100 transition"
            >
              Featured
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
