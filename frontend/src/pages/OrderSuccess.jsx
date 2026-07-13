import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center select-none bg-slate-900 text-slate-100">
        <div className="max-w-md w-full bg-slate-850/30 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10 }}
            className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto text-4xl"
          >
            <CheckCircle2 size={40} className="text-green-500" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-100">Order Placed!</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Thank you for shopping with us. Your payment was verified, and your order has been received.
            </p>
          </div>

          {orderId && (
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Order Reference ID</span>
              <span className="text-sm font-mono font-bold text-violet-400 select-all block">{orderId}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
            <Link
              to="/orders"
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-6 rounded-xl transition"
            >
              <span>Order History</span>
            </Link>
            
            <Link
              to="/products"
              className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-md shadow-violet-950/10"
            >
              <span>Continue Shop</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default OrderSuccess;
