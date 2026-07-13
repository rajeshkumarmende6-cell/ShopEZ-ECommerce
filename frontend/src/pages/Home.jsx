import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import { CategorySkeleton, ProductCardSkeleton } from '../components/Skeletons';
import { 
  ShieldCheck, Truck, RotateCcw, Headset, Star, ShoppingBag, 
  ArrowRight, ChevronLeft, ChevronRight, Gift, Tag, Clock 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useTheme from '../hooks/useTheme';

function PromotionalCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) return {};
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    const value = timeLeft[interval];
    timerComponents.push(
      <div key={interval} className="flex flex-col items-center bg-black/45 border border-slate-800/80 px-2 py-0.5 rounded min-w-[36px]">
        <span className="text-[10px] font-black text-violet-400">{String(value).padStart(2, '0')}</span>
        <span className="text-[7px] text-slate-500 uppercase font-bold">{interval.substring(0, 3)}</span>
      </div>
    );
  });

  if (timerComponents.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800/50 w-fit">
      <Clock size={12} className="text-violet-450 animate-pulse ml-0.5" />
      <span className="text-[9px] uppercase font-bold text-slate-405 mr-1 select-none">Ends in:</span>
      <div className="flex gap-1">
        {timerComponents}
      </div>
    </div>
  );
}

// Premium mock fallbacks in case database has no products yet
const MOCK_CATEGORIES = [
  { _id: 'cat1', name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat2', name: 'Footwear', slug: 'footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat3', name: 'Apparel', slug: 'apparel', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat4', name: 'Watches', slug: 'watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80' },
  { _id: 'cat5', name: 'Fitness', slug: 'fitness', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80' },
];

const MOCK_PRODUCTS = [
  { _id: 'prod1', name: 'AeroBuds Pro Max', brand: 'Sony', price: 149.99, discountPrice: 99.99, ratings: 4.8, numOfReviews: 24, images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80' }] },
  { _id: 'prod2', name: 'Chrono Sport Watch', brand: 'Fossil', price: 249.99, discountPrice: 199.99, ratings: 4.6, numOfReviews: 18, images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80' }] },
  { _id: 'prod3', name: 'Volt Sneakers V2', brand: 'Nike', price: 120.00, discountPrice: 0, ratings: 4.9, numOfReviews: 32, images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }] },
  { _id: 'prod4', name: 'Sleek Leather Wallet', brand: 'Bellroy', price: 65.00, discountPrice: 49.99, ratings: 4.5, numOfReviews: 12, images: [{ url: 'https://images.unsplash.com/photo-1627124765135-56c607a97750?auto=format&fit=crop&w=300&q=80' }] },
];

function Home() {
  const { darkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Attempt backend fetches
        const [catRes, featRes, bestRes, promoRes] = await Promise.allSettled([
          API.get('/categories'),
          API.get('/products?isFeatured=true&limit=4'),
          API.get('/products?isBestSeller=true&limit=4'),
          API.get('/promotions/active'),
        ]);

        if (catRes.status === 'fulfilled' && catRes.value.data.success && catRes.value.data.categories.length > 0) {
          setCategories(catRes.value.data.categories);
        } else {
          setCategories(MOCK_CATEGORIES);
        }

        if (featRes.status === 'fulfilled' && featRes.value.data.success && featRes.value.data.products.length > 0) {
          setFeaturedProducts(featRes.value.data.products);
        } else {
          setFeaturedProducts(MOCK_PRODUCTS);
        }

        if (bestRes.status === 'fulfilled' && bestRes.value.data.success && bestRes.value.data.products.length > 0) {
          setBestSellers(bestRes.value.data.products);
        } else {
          setBestSellers(MOCK_PRODUCTS);
        }

        if (promoRes.status === 'fulfilled' && promoRes.value.data.success && promoRes.value.data.promotions.length > 0) {
          setPromotions(promoRes.value.data.promotions);
        } else {
          setPromotions([]);
        }

      } catch (err) {
        console.warn('Backend connections failed. Loading mock visual experience.');
        setCategories(MOCK_CATEGORIES);
        setFeaturedProducts(MOCK_PRODUCTS);
        setBestSellers(MOCK_PRODUCTS);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promotions]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
  };

  return (
    <MainLayout>
      {/* 1. Hero Dynamic Promotional Section */}
      {promotions.length > 0 ? (
        <section className="relative overflow-hidden transition-all duration-550" style={{ backgroundColor: darkMode ? (promotions[currentSlide].bgColor || '#0f172a') : '#ffffff' }}>
          {/* Subtle decoration elements */}
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-20 lg:py-24 select-none">
            <AnimatePresence mode="wait">
              {promotions.map((promo, idx) => {
                if (idx !== currentSlide) return null;
                return (
                  <motion.div
                    key={promo._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                  >
                    {/* Left text column */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                      
                      {/* Event tag badge & Off percentage */}
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-full border border-violet-500/20 uppercase tracking-wide">
                          ⚡ {promo.eventType}
                        </span>
                        {promo.offerPercentage && (
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-emerald-950/20 text-emerald-400 text-xs font-black rounded-full border border-emerald-500/20 uppercase">
                            Save {promo.offerPercentage}%
                          </span>
                        )}
                        {promo.couponCode && (
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-slate-900/60 text-slate-200 text-xs font-mono font-bold rounded-full border border-slate-800">
                            Code: {promo.couponCode}
                          </span>
                        )}
                      </div>

                      {/* Main Title and description */}
                      <div className="space-y-3">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-100 leading-tight">
                          {promo.title}
                        </h1>
                        {promo.subtitle && (
                          <p className="text-violet-400 font-extrabold text-base sm:text-lg tracking-wide">
                            {promo.subtitle}
                          </p>
                        )}
                      </div>

                      <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        {promo.description}
                      </p>

                      {/* Countdown Timer (if configured) */}
                      {promo.countdownTimer && (
                        <div className="flex justify-center lg:justify-start">
                          <PromotionalCountdown targetDate={promo.countdownTimer} />
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
                        <Link
                          to={promo.ctaUrl || '/products'}
                          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-violet-950/20 transition cursor-pointer"
                        >
                          <span>{promo.ctaText || 'Shop Now'}</span>
                          <ArrowRight size={18} />
                        </Link>
                        {promo.couponCode && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(promo.couponCode);
                              toast.success('Coupon code copied to clipboard!');
                            }}
                            className="inline-flex items-center justify-center bg-slate-900/60 hover:bg-slate-850 text-slate-200 border border-slate-800 font-bold py-3.5 px-8 rounded-xl transition cursor-pointer"
                          >
                            Copy Coupon Code
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right column: Dynamic banner image */}
                    <div className="lg:col-span-5 flex justify-center">
                      <div className="relative group w-full max-w-md">
                        {/* Glow backplate */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        
                        {/* Widescreen Banner for Desktop, hide on mobile */}
                        <img
                          src={promo.desktopBanner.url}
                          alt={promo.title}
                          className="hidden md:block rounded-2xl border border-slate-800 shadow-2xl relative z-10 w-full object-cover aspect-[16/10] group-hover:scale-[1.01] transition duration-300 cursor-pointer"
                          onClick={() => navigate(promo.ctaUrl || '/products')}
                        />
                        {/* Square Banner for Mobile, hide on desktop */}
                        <img
                          src={promo.mobileBanner.url}
                          alt={promo.title}
                          className="block md:hidden rounded-2xl border border-slate-800 shadow-2xl relative z-10 w-full object-cover aspect-square cursor-pointer"
                          onClick={() => navigate(promo.ctaUrl || '/products')}
                        />
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Manual Navigation Controls (if multiple active) */}
            {promotions.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white p-2 rounded-xl cursor-pointer hover:bg-slate-800 transition z-20"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white p-2 rounded-xl cursor-pointer hover:bg-slate-800 transition z-20"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Dots indicator */}
                <div className="flex justify-center gap-2 mt-8 z-20 relative">
                  {promotions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-2 h-2 rounded-full transition cursor-pointer ${
                        currentSlide === i 
                          ? 'bg-violet-500 scale-120 shadow shadow-violet-500' 
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      ) : (
        /* Original Static Fallback Hero Section */
        <section className="relative bg-slate-900 dark:bg-slate-950 overflow-hidden py-20 lg:py-32">
          {/* Glow Spheres */}
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-semibold rounded-full border border-violet-500/20">
                ⚡ Exclusive Summer Sale - Up to 40% Off
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 leading-tight">
                Elevate Your <br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  Shopping Standard
                </span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Explore the latest in high-performance electronics, bespoke designer apparel, athletic footwear, and luxury accessories.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-violet-900/20 transition cursor-pointer"
                >
                  <span>Shop Collection</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/products?isFeatured=true"
                  className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 font-bold py-3.5 px-8 rounded-xl transition"
                >
                  View Hot Offers
                </Link>
              </div>
            </motion.div>

            {/* Hero Image / Mock graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="relative group max-w-md w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition duration-500"></div>
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
                  alt="Featured Product"
                  className="rounded-2xl border border-slate-700 shadow-2xl relative z-10 w-full object-cover aspect-4/3 group-hover:scale-[1.01] transition duration-300"
                />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 2. Categories Section */}
      <section className="py-12 bg-slate-900 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">Browse Categories</h2>
            <Link to="/products" className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-thin">
            {loading
              ? [...Array(5)].map((_, i) => <CategorySkeleton key={i} />)
              : categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat._id}`}
                    className="flex flex-col items-center space-y-3 flex-shrink-0 group text-center"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center p-1 overflow-hidden group-hover:border-violet-500/60 shadow-lg transition duration-300">
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-300"
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-violet-400 transition">
                      {cat.name}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Showcase */}
      <section className="py-16 bg-slate-900 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Featured Releases</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Curated picks that deliver top-tier performance</p>
            </div>
            <Link to="/products?isFeatured=true" className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition flex items-center gap-1">
              <span>Explore All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
          </div>
        </div>
      </section>

      {/* 4. Quality Badges Section */}
      <section className="py-16 border-t border-b border-slate-800/40 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-850">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-slate-200 font-bold text-sm">Free Express Delivery</h4>
              <p className="text-xs text-slate-500">For all orders exceeding $99</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-850">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="text-slate-200 font-bold text-sm">Easy Returns</h4>
              <p className="text-xs text-slate-500">30-day hassle-free replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-850">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-slate-200 font-bold text-sm">100% Secure Checkouts</h4>
              <p className="text-xs text-slate-500">Stripe and Razorpay encrypted</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-850">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <Headset size={24} />
            </div>
            <div>
              <h4 className="text-slate-200 font-bold text-sm">24/7 Live Support</h4>
              <p className="text-xs text-slate-500">Chat with expert customer desks</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Best Sellers Section */}
      <section className="py-16 bg-slate-900 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Best Selling Essentials</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Our customer favorites based on high reviews</p>
            </div>
            <Link to="/products?isBestSeller=true" className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
              : bestSellers.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
          </div>
        </div>
      </section>

    </MainLayout>
  );
}

// Reusable Product Card Component with Hover Animations & Badges
function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const imageSrc = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
  const hasDiscount = product.discountPrice > 0;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;
  
  return (
    <div
      onClick={handleCardClick}
      className="bg-slate-900 dark:bg-slate-800/35 border border-slate-700/40 hover:border-violet-500/40 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:shadow-violet-950/5 group cursor-pointer transition duration-300 select-none relative overflow-hidden"
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <span className="absolute top-4 left-4 z-10 bg-violet-600 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow border border-violet-500/20">
          {discountPercentage}% OFF
        </span>
      )}

      {/* Image Block */}
      <div className="rounded-xl overflow-hidden aspect-square bg-slate-900 border border-slate-750 flex items-center justify-center relative mb-4">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
          loading="lazy"
        />
      </div>

      {/* Details Block */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{product.brand}</span>
          <h3 className="text-slate-200 font-bold text-base truncate group-hover:text-violet-400 transition mt-0.5">
            {product.name}
          </h3>

          {/* Ratings row */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star size={12} fill="currentColor" />
            </div>
            <span className="text-xs font-bold text-slate-350">{product.ratings.toFixed(1)}</span>
            <span className="text-slate-500 text-[10px]">({product.numOfReviews})</span>
          </div>
        </div>

        {/* Price and Cart Action row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/40 mt-1">
          <div className="flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="text-base font-extrabold text-violet-400">${product.discountPrice.toFixed(2)}</span>
                <span className="text-xs text-slate-500 line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-base font-extrabold text-slate-200">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product._id}`);
            }}
            className="p-2 bg-slate-850 dark:bg-slate-700/50 group-hover:bg-violet-600 group-hover:text-white text-slate-300 rounded-xl transition cursor-pointer"
            title="View Details"
          >
            <ShoppingBag size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}

export default Home;
export { ProductCard };
