import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import { Package, ChevronDown, Clock, ShieldCheck, ShoppingBag } from 'lucide-react';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/orders/me');
        if (data?.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.warn('API error loading orders. Loading empty order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrderExpand = (id) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Shipped': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2 select-none">
          <Package size={28} className="text-violet-500" />
          <span>My Orders</span>
        </h1>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-800/40 rounded-2xl border border-slate-800"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4 select-none">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={order._id}
                  className="bg-slate-800/20 border border-slate-800 rounded-2xl overflow-hidden transition hover:border-slate-750"
                >
                  
                  {/* Order main info header row */}
                  <div
                    onClick={() => toggleOrderExpand(order._id)}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-850/10 transition"
                  >
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Order Placed</span>
                        <span className="text-slate-300 font-medium">{formattedDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Paid</span>
                        <span className="text-violet-400 font-bold">${order.totalPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Shipment Status</span>
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border mt-0.5 ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Payment</span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            order.paymentInfo.status === 'succeeded'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {order.paymentInfo.status === 'succeeded' ? 'Paid' : 'Pending'}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-750">
                            {order.paymentInfo.method === 'Razorpay' ? '⚡ UPI / Razorpay' : order.paymentInfo.method}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold self-end sm:self-center">
                      <span>Details</span>
                      <ChevronDown size={14} className={`transition duration-200 ${isExpanded ? 'rotate-180 text-violet-400' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Items Drawer */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-slate-850/80 bg-slate-900/10 space-y-4 pt-4">
                      
                      {/* Products List */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Items Purchased</span>
                        
                        {order.orderItems.map((item, idx) => (
                          <div key={item._id || idx} className="flex gap-4 items-center bg-slate-900/30 p-3 rounded-xl border border-slate-850">
                            {/* Mini Image */}
                            <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0">
                              <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50'} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Quantity: {item.quantity} x ${item.price.toFixed(2)}</p>
                            </div>
                            <span className="text-xs font-bold text-slate-300">${(item.quantity * item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping details info block */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                        <div className="space-y-1 bg-slate-900/20 p-4 border border-slate-850/50 rounded-xl">
                          <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">Delivery Address</span>
                          <p className="text-slate-350 font-medium">{order.shippingAddress.fullName}</p>
                          <p className="text-slate-450 leading-relaxed">
                            {order.shippingAddress.streetAddress}, <br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                          </p>
                          <p className="text-slate-500">Phone: {order.shippingAddress.phoneNumber}</p>
                        </div>

                        <div className="space-y-1.5 bg-slate-900/20 p-4 border border-slate-850/50 rounded-xl flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-555 font-bold uppercase tracking-wider block">Payment Summary</span>
                            <div className="flex justify-between text-slate-400">
                              <span>Subtotal</span>
                              <span>${order.itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Shipping</span>
                              <span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Estimated Taxes</span>
                              <span>${order.taxPrice.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-slate-250 border-t border-slate-800/80 pt-2">
                            <span>Amount Paid</span>
                            <span className="text-violet-400">${order.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty History State */
          <div className="text-center py-20 bg-slate-855/5 border border-dashed border-slate-800 rounded-3xl space-y-6">
            <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              📦
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-200">No Orders Placed</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                You haven't placed any purchases yet. Explore our collections and checkout your first item!
              </p>
            </div>
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Orders;
