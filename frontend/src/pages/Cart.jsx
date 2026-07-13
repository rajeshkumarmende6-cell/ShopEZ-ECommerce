import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import useCart from '../hooks/useCart';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal > 99 || subtotal === 0 ? 0.0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax estimation
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const hasItems = cart.items && cart.items.length > 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2 select-none">
          <ShoppingCart size={28} className="text-violet-500" />
          <span>Shopping Cart</span>
        </h1>

        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Cart Items list (Left Columns) */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const product = item.product;
                const price = product.discountPrice > 0 ? product.discountPrice : product.price;
                const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';
                
                return (
                  <div
                    key={item._id || product._id}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-6 items-center select-none"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                      <img src={image} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{product.brand}</span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-200 truncate hover:text-violet-400">
                        <Link to={`/products/${product._id}`}>{product.name}</Link>
                      </h3>

                      {/* Pricing row */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-violet-400">${price.toFixed(2)}</span>
                        {product.discountPrice > 0 && (
                          <span className="text-xs text-slate-500 line-through">${product.price.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Controls row */}
                      <div className="flex justify-between items-center pt-2 gap-2">
                        <div className="flex items-center bg-slate-900 border border-slate-850 rounded-lg py-1 px-2">
                          <button
                            onClick={() => updateQuantity(item._id || product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-1 text-slate-400 hover:text-slate-100 disabled:opacity-40 font-extrabold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-300">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id || product._id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            className="px-1 text-slate-400 hover:text-slate-100 disabled:opacity-40 font-extrabold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item._id || product._id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary Card (Right Column) */}
            <div className="lg:col-span-1 bg-slate-850/30 border border-slate-800/80 p-6 rounded-2xl space-y-6 select-none">
              <h3 className="font-bold text-lg text-slate-100 pb-3 border-b border-slate-850">Order Summary</h3>

              <div className="space-y-3.5 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <span>Shipping Fee</span>
                    <HelpCircle size={13} className="text-slate-500 cursor-help" title="Free delivery on orders above $99" />
                  </span>
                  <span className="text-slate-200 font-medium">
                    {shipping === 0 ? <span className="text-green-400 font-bold">Free</span> : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="text-slate-200 font-medium">${tax.toFixed(2)}</span>
                </div>
                
                {shipping > 0 && (
                  <div className="p-2.5 bg-violet-650/5 border border-violet-500/10 rounded-xl text-xs text-violet-300">
                    Add <span className="font-bold text-violet-400">${(99.01 - subtotal).toFixed(2)}</span> more to unlock **Free Delivery**!
                  </div>
                )}
                
                <div className="flex justify-between text-base font-extrabold text-slate-200 pt-3 border-t border-slate-850">
                  <span>Total Amount</span>
                  <span className="text-violet-400">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-violet-950/20 cursor-pointer active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>
                
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span>Secure Checkout & Payment Guarantees</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Empty Cart State */
          <div className="text-center py-20 bg-slate-850/10 border border-dashed border-slate-800 rounded-3xl space-y-6">
            <div className="w-20 h-20 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              🛒
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-200">Your Cart is Empty</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Looks like you haven't added any products to your shopping cart yet. Let's find some deals!
              </p>
            </div>
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Cart;
