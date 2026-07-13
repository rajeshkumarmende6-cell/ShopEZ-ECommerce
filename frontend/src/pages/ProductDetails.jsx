import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import useWishlist from '../hooks/useWishlist';
import { ProductDetailsSkeleton } from '../components/Skeletons';
import { Star, ShoppingCart, Heart, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, inWishlist } = useWishlist();

  // API State
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery Active Image
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Cart Qty selection
  const [qty, setQty] = useState(1);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product data and reviews
  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, revRes] = await Promise.all([
        API.get(`/products/${id}`),
        API.get(`/products/${id}/reviews`),
      ]);

      if (prodRes.data?.success) {
        setProduct(prodRes.data.product);
      }
      if (revRes.data?.success) {
        setReviews(revRes.data.reviews);
      }
    } catch (err) {
      console.warn('API error fetching product details. Loading mock item details.');
      // Premium Mock product detail in case of offline/missing DB entry
      setProduct({
        _id: id,
        name: 'AeroBuds Pro Max Wireless Headphones',
        brand: 'Sony',
        description: 'Experience pure music bliss with industry-leading Active Noise Cancellation (ANC), ambient awareness settings, smart multi-point Bluetooth pairing, and up to 40 hours of continuous high-fidelity playback. Features ergonomic memory foam earcups and quick-charge support (5 mins charge = 5 hours playback).',
        price: 149.99,
        discountPrice: 99.99,
        stock: 12,
        ratings: 4.8,
        numOfReviews: 1,
        images: [
          { public_id: 'img1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
          { public_id: 'img2', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600' },
          { public_id: 'img3', url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600' },
        ],
        category: { name: 'Electronics', slug: 'electronics' },
      });
      setReviews([
        {
          _id: 'rev1',
          name: 'Jane Doe',
          rating: 5,
          comment: 'Outstanding sound quality! The battery life is absolutely insane and ANC works flawlessly.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductData();
    setQty(1);
    setActiveImageIndex(0);
  }, [fetchProductData]);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Product is out of stock!');
      return;
    }
    addToCart(product, qty);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    try {
      setSubmittingReview(true);
      const { data } = await API.post(`/products/${id}/reviews`, {
        rating,
        comment,
      });
      if (data?.success) {
        toast.success(data.message || 'Review submitted!');
        setComment('');
        setRating(5);
        fetchProductData(); // refresh product score and review list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <ProductDetailsSkeleton />
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Product Not Found</h2>
          <p className="text-slate-400">The product you are looking for might have been removed.</p>
          <Link to="/products" className="text-violet-400 hover:underline">Back to Shop</Link>
        </div>
      </MainLayout>
    );
  }

  const isLiked = inWishlist(product._id);
  const mainImage = product.images?.[activeImageIndex]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
  const hasDiscount = product.discountPrice > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 flex-1">
        
        {/* Back navigation */}
        <div>
          <Link
            to="/products"
            className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 transition space-x-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Product details layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14">
          
          {/* Images Gallery Column */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover transition duration-300"
              />
              {isOutOfStock && (
                <span className="absolute top-4 left-4 bg-slate-900/90 text-red-400 font-extrabold text-xs uppercase px-3 py-1 rounded-lg border border-red-500/20">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Thumbnails list */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.public_id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-slate-950 flex-shrink-0 cursor-pointer transition ${
                      activeImageIndex === idx ? 'border-violet-500' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Information Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-violet-400">{product.brand}</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 leading-snug">{product.name}</h1>
              
              {/* Reviews Summary */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-400 gap-0.5">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold text-slate-200 pl-1">{product.ratings.toFixed(1)}</span>
                </div>
                <span className="text-slate-600 text-sm">|</span>
                <span className="text-xs text-slate-400">{reviews.length} Customer Reviews</span>
              </div>
            </div>

            {/* Pricing block */}
            <div className="p-4 bg-slate-850/20 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block mb-0.5">Price</span>
                <div className="flex items-baseline gap-3">
                  {hasDiscount ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-extrabold text-violet-400">${product.discountPrice.toFixed(2)}</span>
                      <span className="text-sm text-slate-500 line-through">${product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-200">${product.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block mb-0.5">Availability</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isOutOfStock 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' 
                    : 'bg-green-500/10 text-green-400 border-green-500/25'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} items left`}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
              <p className="text-slate-350 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector & Checkout Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-450">Quantity</span>
                  <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-xl py-1 px-2.5">
                    <button
                      onClick={() => setQty(prev => Math.max(1, prev - 1))}
                      disabled={qty <= 1}
                      className="px-2 text-slate-400 hover:text-slate-100 disabled:opacity-40 cursor-pointer text-lg font-bold"
                    >
                      -
                    </button>
                    <span className="px-3.5 text-sm font-bold text-slate-200">{qty}</span>
                    <button
                      onClick={() => setQty(prev => Math.min(product.stock, prev + 1))}
                      disabled={qty >= product.stock}
                      className="px-2 text-slate-400 hover:text-slate-100 disabled:opacity-40 cursor-pointer text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* Cart trigger */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Shopping Cart</span>
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`py-3 px-4 rounded-xl border flex items-center justify-center cursor-pointer transition ${
                    isLiked
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-slate-850 border-slate-750 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                  title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- REVIEWS SECTION -------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 border-t border-slate-800">
          
          {/* Review Stats summary (Left column) */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-slate-200">Customer Reviews</h2>
            <div className="bg-slate-850/15 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="text-center py-4 space-y-1">
                <span className="text-5xl font-black text-slate-100">{product.ratings.toFixed(1)}</span>
                <div className="flex items-center justify-center text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.round(product.ratings) ? 'currentColor' : 'none'}
                      className={i < Math.round(product.ratings) ? 'text-amber-400' : 'text-slate-600'}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 pt-1">Out of 5 stars ({reviews.length} reviews)</p>
              </div>
            </div>
          </div>

          {/* Reviews list and submit review (Right columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Review Form */}
            {user ? (
              <div className="bg-slate-850/20 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">Write a Customer Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  
                  {/* Stars Rating Select */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Your Rating:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRating(num)}
                          className="text-amber-400 hover:scale-110 transition cursor-pointer"
                        >
                          <Star size={20} fill={num <= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-1.5">
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      className="w-full bg-slate-900 border border-slate-750 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none transition resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-violet-650 hover:text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 bg-slate-850/10 border border-dashed border-slate-800 rounded-xl text-center text-sm text-slate-400">
                Please{' '}
                <Link to="/login" className="text-violet-400 font-semibold hover:underline">
                  sign in
                </Link>{' '}
                to write a customer review.
              </div>
            )}

            {/* 2. Review List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">Reviews List</h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-5 bg-slate-900/30 border border-slate-850 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-200">{rev.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            className="mr-0.5"
                          />
                        ))}
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No customer reviews yet. Be the first to write a review!</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default ProductDetails;
