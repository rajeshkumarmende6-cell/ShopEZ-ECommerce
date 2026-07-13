import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import useCart from '../hooks/useCart';
import API from '../services/api';
import { useForm } from 'react-hook-form';
import { MapPin, CreditCard, ShieldCheck, ArrowRight, Loader2, Plus, X, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // API State
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Checkout workflow state
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  // Inline address form toggle
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Price calculations
  const subtotal = getCartTotal();
  const shipping = subtotal > 99 ? 0.0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      const { data } = await API.get('/addresses');
      if (data?.success) {
        setAddresses(data.addresses);
        // Pre-select default address
        const defaultAddr = data.addresses.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0]._id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch addresses for checkout');
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if cart is empty
    if (cart.items.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, [cart, navigate]);

  const handleAddNewAddress = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await API.post('/addresses', data);
      if (res.data?.success) {
        toast.success('Address added successfully');
        setShowAddressForm(false);
        reset();
        await fetchAddresses();
      }
    } catch (err) {
      toast.error('Failed to save address details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    const shippingAddressObj = addresses.find((a) => a._id === selectedAddressId);
    if (!shippingAddressObj) {
      toast.error('Selected address is invalid');
      return;
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
      image: item.product.images?.[0]?.url || '',
      quantity: item.quantity,
    }));

    try {
      setIsSubmitting(true);
      
      // 1. Create order and intent in backend
      const { data } = await API.post('/orders', {
        orderItems,
        shippingAddress: {
          fullName: shippingAddressObj.fullName,
          phoneNumber: shippingAddressObj.phoneNumber,
          streetAddress: shippingAddressObj.streetAddress,
          city: shippingAddressObj.city,
          state: shippingAddressObj.state,
          postalCode: shippingAddressObj.postalCode,
          country: shippingAddressObj.country,
        },
        paymentMethod,
        orderNotes,
      });

      if (data?.success) {
        const { orderId, clientSecret } = data;

        // 2. Perform Payment Intent Confirmation
        if (paymentMethod === 'Stripe') {
          // If we receive a mock secret, simulate card loading and then finalize
          if (clientSecret.startsWith('pi_mock_')) {
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate gateway authorization
            
            // Confirm in backend
            const confirmRes = await API.post(`/orders/${orderId}/confirm`, {
              paymentIntentId: clientSecret.split('_secret_')[0], // Extract mock intent ID
            });
            
            if (confirmRes.data?.success) {
              clearCart();
              toast.success('Payment completed successfully!');
              navigate(`/order-success?orderId=${orderId}`);
            }
          } else {
            // Real Stripe integration trigger (fallback mock success for sandbox simplicity)
            const confirmRes = await API.post(`/orders/${orderId}/confirm`, {
              paymentIntentId: clientSecret,
            });
            if (confirmRes.data?.success) {
              clearCart();
              navigate(`/order-success?orderId=${orderId}`);
            }
          }
        } else {
          // COD Flow
          const confirmRes = await API.post(`/orders/${orderId}/confirm`, {});
          if (confirmRes.data?.success) {
            clearCart();
            toast.success('Order placed successfully (COD)!');
            navigate(`/order-success?orderId=${orderId}`);
          }
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-none">
        
        {/* Left Columns: shipping address selection & payment form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping Address Selection */}
          <div className="bg-slate-850/20 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <MapPin size={18} className="text-violet-400" />
                <span>1. Shipping Address</span>
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Inline Address Form */}
            {showAddressForm && (
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4 relative">
                <button onClick={() => setShowAddressForm(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 cursor-pointer">
                  <X size={16} />
                </button>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Add shipping destination</h4>
                <form onSubmit={handleSubmit(handleAddNewAddress)} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Recipient Name</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-200" {...register('fullName', { required: true })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Phone</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-200" {...register('phoneNumber', { required: true })} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Street Address</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-200" {...register('streetAddress', { required: true })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">City</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-200" {...register('city', { required: true })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">State</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-200" {...register('state', { required: true })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Postal Code</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-200" {...register('postalCode', { required: true })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Country</label>
                    <input type="text" defaultValue="India" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-200" {...register('country', { required: true })} />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-850">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-1.5 bg-slate-800 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-violet-600 rounded-lg text-white">Save</button>
                  </div>
                </form>
              </div>
            )}

            {/* Address cards list */}
            {addressesLoading ? (
              <div className="h-20 bg-slate-900 animate-pulse rounded-xl"></div>
            ) : addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressId(addr._id)}
                    className={`p-4 border rounded-xl cursor-pointer transition flex flex-col justify-between ${
                      selectedAddressId === addr._id
                        ? 'bg-violet-950/10 border-violet-500/50 text-slate-200'
                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-200">{addr.fullName}</span>
                        {addr.isDefault && <span className="text-[9px] bg-slate-850 px-1.5 py-0.5 rounded text-violet-400 border border-violet-500/10 font-bold uppercase">Default</span>}
                      </div>
                      <p className="text-[11px] leading-relaxed mt-2">
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 block font-medium">Phone: {addr.phoneNumber}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-500">
                Please add a shipping address above to complete your order.
              </div>
            )}

          </div>

          {/* Payment Method Option Selector */}
          <div className="bg-slate-850/20 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="font-bold text-base text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
              <CreditCard size={18} className="text-violet-400" />
              <span>2. Payment Option</span>
            </h2>

            <div className="flex gap-4">
              <label
                onClick={() => setPaymentMethod('Stripe')}
                className={`flex-1 p-4 border rounded-xl cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'Stripe'
                    ? 'bg-violet-950/10 border-violet-500/50 text-slate-200'
                    : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <input type="radio" checked={paymentMethod === 'Stripe'} readOnly className="text-violet-600 focus:ring-0" />
                <div>
                  <span className="font-bold text-sm block text-slate-200">Stripe Checkout</span>
                  <span className="text-[10px] text-slate-500 block">Credit / Debit Cards</span>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex-1 p-4 border rounded-xl cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'COD'
                    ? 'bg-violet-950/10 border-violet-500/50 text-slate-200'
                    : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <input type="radio" checked={paymentMethod === 'COD'} readOnly className="text-violet-600 focus:ring-0" />
                <div>
                  <span className="font-bold text-sm block text-slate-200">Cash on Delivery (COD)</span>
                  <span className="text-[10px] text-slate-500 block">Pay upon delivery</span>
                </div>
              </label>
            </div>

            {/* Custom Payment Credentials Fields (Visual Sandbox simulation) */}
            {paymentMethod === 'Stripe' && (
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wide">Secure Card Payment Details</h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="col-span-3 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Card Number</label>
                    <input type="text" placeholder="4242 4242 4242 4242 (Stripe Test Card)" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200" defaultValue="4242424242424242" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Expiration Date</label>
                    <input type="text" placeholder="MM/YY" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200" defaultValue="12/28" />
                  </div>
                  <div className="col-span-1 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">CVC</label>
                    <input type="text" placeholder="123" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200" defaultValue="424" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 3. Order Notes Section */}
          <div className="bg-slate-850/20 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="font-bold text-base text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
              <FileText size={18} className="text-violet-400" />
              <span>3. Order Notes (Optional)</span>
            </h2>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Add any special instructions, delivery gates, or order details here..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-violet-500/50 rounded-xl p-4 text-xs text-slate-200 focus:outline-none transition resize-none"
            />
          </div>

        </div>

        {/* Right Column: checkout total and triggers */}
        <div className="lg:col-span-1 bg-slate-850/30 border border-slate-800/80 p-6 rounded-2xl space-y-6">
          <h3 className="font-bold text-lg text-slate-100 pb-3 border-b border-slate-850">Billing Summary</h3>

          <div className="space-y-4 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-200 font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-slate-200 font-medium">
                {shipping === 0 ? <span className="text-green-400 font-bold">Free</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Taxes</span>
              <span className="text-slate-200 font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-200 pt-3 border-t border-slate-850">
              <span>Total Amount</span>
              <span className="text-violet-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || addresses.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-violet-950/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Place Order (${total.toFixed(2)})</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-850">
            <ShieldCheck size={14} className="text-green-500" />
            <span>Encrypted payment connection</span>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}

export default Checkout;
