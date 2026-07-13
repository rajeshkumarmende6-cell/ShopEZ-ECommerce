import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import API from '../../services/api';
import { FileText, Eye, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders'); // Admin retrieves all orders
      if (data?.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.warn('API error loading orders. Loading mock logs.');
      setOrders([
        {
          _id: 'ord1',
          user: { name: 'Alice Smith', email: 'alice@gmail.com' },
          totalPrice: 249.99,
          orderStatus: 'Processing',
          paymentInfo: { status: 'succeeded', method: 'Stripe' },
          shippingAddress: { fullName: 'Alice Smith', streetAddress: '123 Tech Lane', city: 'Delhi', state: 'Delhi', postalCode: '110001', country: 'India', phoneNumber: '9876543210' },
          orderItems: [{ name: 'Chrono Sport Watch', quantity: 1, price: 249.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50' }],
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await API.put(`/orders/${id}`, { status: newStatus });
      if (data?.success) {
        toast.success(data.message || 'Order status updated');
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update order status');
    }
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
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
              <FileText className="text-violet-500" size={28} />
              <span>Manage Orders</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Review checkout receipts, process payments, and dispatch shipments</p>
          </div>
        </div>

        {/* Orders List Table */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-violet-500 w-12 h-12" />
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left text-slate-400">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 bg-slate-900/50">
                  <th className="py-3 px-6 font-bold uppercase">Customer</th>
                  <th className="py-3 px-6 font-bold uppercase">Total Price</th>
                  <th className="py-3 px-6 font-bold uppercase">Payment status</th>
                  <th className="py-3 px-6 font-bold uppercase">Shipment status</th>
                  <th className="py-3 px-6 font-bold uppercase">Placed On</th>
                  <th className="py-3 px-6 font-bold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const isExpanded = expandedOrderId === ord._id;
                  return (
                    <React.Fragment key={ord._id}>
                      <tr className="border-b border-slate-850 hover:bg-slate-850/5 transition">
                        <td className="py-4 px-6 font-bold text-slate-200">{ord.user?.name || 'Guest'}</td>
                        <td className="py-4 px-6 font-extrabold text-violet-400">${ord.totalPrice.toFixed(2)}</td>
                        <td className="py-4 px-6 font-semibold">
                          <span className={`px-2 py-0.5 rounded border ${
                            ord.paymentInfo.status === 'succeeded' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {ord.paymentInfo.status === 'succeeded' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {ord.orderStatus === 'Delivered' || ord.orderStatus === 'Cancelled' ? (
                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusColor(ord.orderStatus)}`}>
                              {ord.orderStatus}
                            </span>
                          ) : (
                            <div className="relative inline-block select-none">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                                className={`pl-2.5 pr-7 py-1 rounded-xl border focus:outline-none appearance-none bg-slate-950 border-slate-800 text-xs font-semibold cursor-pointer ${getStatusColor(ord.orderStatus)}`}
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-[8px] text-slate-500">
                                ▼
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {new Date(ord.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : ord._id)}
                            className="p-1.5 bg-slate-850 border border-slate-800 hover:text-violet-400 text-slate-450 rounded-lg cursor-pointer"
                          >
                            <Eye size={12} />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded View */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-950/45 p-6 border-b border-slate-850">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                              <div>
                                <h4 className="font-bold text-slate-300 uppercase tracking-wide text-[10px] mb-2">Delivery Details</h4>
                                <p className="font-bold text-slate-350">{ord.shippingAddress.fullName}</p>
                                <p className="text-slate-500">{ord.shippingAddress.streetAddress}, {ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.postalCode}</p>
                                <p className="text-slate-600 mt-1">Contact: {ord.shippingAddress.phoneNumber}</p>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-300 uppercase tracking-wide text-[10px] mb-2">Items Breakdown</h4>
                                <div className="space-y-2">
                                  {ord.orderItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-900 border border-slate-850 p-2.5 rounded-lg">
                                      <div className="flex gap-2.5 items-center">
                                        <div className="w-8 h-8 bg-slate-950 border border-slate-850 rounded overflow-hidden">
                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-semibold text-slate-300 truncate max-w-[150px]">{item.name}</span>
                                      </div>
                                      <span className="text-slate-500 font-medium">Qty: {item.quantity} x ${item.price.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-sm">No checkout records exist in the database.</p>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminOrders;
