import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import useWishlist from '../hooks/useWishlist';
import useCart from '../hooks/useCart';
import { Heart, Trash2, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('Product is out of stock!');
      return;
    }
    addToCart(product, 1);
  };

  const hasItems = wishlist.products && wishlist.products.length > 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2 select-none">
          <Heart size={28} className="text-rose-500" fill="currentColor" />
          <span>My Wishlist</span>
        </h1>

        {hasItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
            {wishlist.products.map((prod) => {
              const image = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
              const price = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
              const hasDiscount = prod.discountPrice > 0;

              return (
                <div
                  key={prod._id}
                  onClick={() => navigate(`/products/${prod._id}`)}
                  className="bg-slate-800/35 border border-slate-700/40 hover:border-violet-500/40 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl transition duration-300 group cursor-pointer relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(prod);
                    }}
                    className="absolute top-4 right-4 z-10 p-1.5 bg-slate-900/80 border border-slate-800 text-rose-400 hover:text-rose-350 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Image */}
                  <div className="rounded-xl overflow-hidden aspect-square bg-slate-900 border border-slate-750 flex items-center justify-center mb-4">
                    <img src={image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300" />
                  </div>

                  {/* Meta details */}
                  <div className="space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{prod.brand}</span>
                      <h3 className="text-slate-200 font-bold text-base truncate group-hover:text-violet-400 mt-0.5">
                        {prod.name}
                      </h3>

                      {/* Ratings */}
                      {prod.ratings !== undefined && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="flex items-center text-amber-400">
                            <Star size={12} fill="currentColor" />
                          </div>
                          <span className="text-xs font-bold text-slate-350">{prod.ratings.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Cart button row */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/40 mt-1">
                      <div className="flex items-baseline gap-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-base font-extrabold text-violet-400">${prod.discountPrice.toFixed(2)}</span>
                            <span className="text-xs text-slate-500 line-through">${prod.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-base font-extrabold text-slate-200">${prod.price.toFixed(2)}</span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCart(prod, e)}
                        disabled={prod.stock === 0}
                        className="p-2 bg-slate-700/50 hover:bg-violet-650 hover:text-white text-slate-300 rounded-xl transition cursor-pointer disabled:opacity-40"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={15} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Wishlist State */
          <div className="text-center py-20 bg-slate-850/10 border border-dashed border-slate-800 rounded-3xl space-y-6">
            <div className="w-20 h-20 bg-slate-800 text-rose-500/60 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ❤️
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-200">Your Wishlist is Empty</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Save your favorite products to your wishlist so you can buy them later. Let's find some favorites!
              </p>
            </div>
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
            >
              Discover Products
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Wishlist;
