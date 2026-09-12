import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldCheck, QrCode, Smartphone, AtSign, CheckCircle2, 
  AlertCircle, Loader2, Sparkles, Lock, ArrowRight, RefreshCw 
} from 'lucide-react';

/**
 * Razorpay UPI Checkout Modal (Sandbox & Test Mode Simulator)
 * Allows customers to experience the complete authentic Razorpay payment process 
 * with UPI QR, UPI Apps (GPay, PhonePe, Paytm), and UPI ID without deducting any real money.
 */
function RazorpayModal({
  isOpen,
  onClose,
  onSuccess,
  amountInUSD = 0,
  amountInINR = 0,
  orderId = '',
  customerDetails = {},
  isMock = true
}) {
  const [activeTab, setActiveTab] = useState('qr'); // 'qr', 'apps', 'upi_id'
  const [upiId, setUpiId] = useState('success@razorpay');
  const [selectedApp, setSelectedApp] = useState('Google Pay');
  const [paymentState, setPaymentState] = useState('idle'); // 'idle', 'processing', 'success', 'failed'
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutes QR timer
  const [processingStep, setProcessingStep] = useState(1);

  // Calculate INR if not directly supplied (approx 83 INR per USD)
  const displayINR = amountInINR > 0 ? amountInINR : Number((amountInUSD * 83).toFixed(2));
  const formattedINR = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(displayINR);

  // Timer countdown for QR Code validity
  useEffect(() => {
    if (!isOpen || paymentState !== 'idle') return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, paymentState]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentState('idle');
      setProcessingStep(1);
      setErrorMessage('');
      setCountdown(600);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const executeSimulatedPayment = (isFailureScenario = false) => {
    setPaymentState('processing');
    setProcessingStep(1);

    // Step 1: Contacting UPI Server
    setTimeout(() => {
      setProcessingStep(2);
    }, 1200);

    // Step 2: Awaiting Authorization
    setTimeout(() => {
      if (isFailureScenario || upiId.includes('fail') || upiId.includes('decline')) {
        setPaymentState('failed');
        setErrorMessage('UPI transaction was declined or timed out in test mode.');
      } else {
        setProcessingStep(3);
        // Step 3: Success Confirmation
        setTimeout(() => {
          setPaymentState('success');
          const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
          const mockOrderId = orderId || `order_${Math.random().toString(36).substring(2, 12)}`;
          const mockSignature = `sig_mock_${Math.random().toString(36).substring(2, 18)}`;

          setTimeout(() => {
            onSuccess({
              razorpay_payment_id: mockPaymentId,
              razorpay_order_id: mockOrderId,
              razorpay_signature: mockSignature
            });
          }, 1500);
        }, 1000);
      }
    }, 2400);
  };

  const upiApps = [
    { name: 'Google Pay', icon: '⚡', color: 'from-blue-500 to-emerald-500', popular: true },
    { name: 'PhonePe', icon: '🟣', color: 'from-purple-600 to-indigo-650', popular: true },
    { name: 'Paytm', icon: '🔷', color: 'from-cyan-500 to-blue-600', popular: true },
    { name: 'BHIM UPI', icon: '🇮🇳', color: 'from-orange-500 to-green-600', popular: false },
    { name: 'CRED UPI', icon: '👑', color: 'from-slate-700 to-slate-900', popular: false }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative text-slate-100"
        >
          {/* Razorpay Authentic Header */}
          <div className="bg-gradient-to-r from-[#0c2340] to-[#0d3460] px-6 py-4 border-b border-blue-900/40 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              {/* Razorpay Brand Glyph */}
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 text-white font-extrabold text-xl tracking-tighter transform -rotate-6">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-wide text-white">ShopEZ Store</span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={10} className="text-blue-400" />
                    Razorpay
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/70 mt-0.5 font-medium">
                  UPI & Online Payment Gateway
                </p>
              </div>
            </div>

            {/* Price & Close */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider block">Total Payable</span>
                <span className="text-base font-extrabold text-white tracking-tight">{formattedINR}</span>
                <span className="text-[10px] text-blue-300/80 block">(${amountInUSD.toFixed(2)})</span>
              </div>
              {paymentState !== 'processing' && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/10 text-blue-200 hover:text-white transition cursor-pointer"
                  title="Cancel Payment"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Test Mode Warning / Guarantee Banner */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-bold text-[11px]">Razorpay Test Mode Active:</span>
              <span className="text-[11px] text-amber-200/90 hidden sm:inline">No real money will be transferred or deducted.</span>
            </div>
            <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 font-bold border border-amber-400/20">
              Sandbox
            </span>
          </div>

          {/* Modal Body State Switcher */}
          <div className="p-6">
            {/* 1. IDLE STATE - Selecting payment method */}
            {paymentState === 'idle' && (
              <div className="space-y-5">
                {/* Method Navigation Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  <button
                    onClick={() => setActiveTab('qr')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'qr'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <QrCode size={15} />
                    <span>UPI QR</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('apps')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'apps'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone size={15} />
                    <span>UPI Apps</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('upi_id')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'upi_id'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <AtSign size={15} />
                    <span>UPI ID / VPA</span>
                  </button>
                </div>

                {/* TAB 1: UPI QR CODE */}
                {activeTab === 'qr' && (
                  <div className="flex flex-col items-center text-center space-y-4 pt-1">
                    <div className="relative p-4 bg-white rounded-2xl shadow-xl border-4 border-blue-500/30 group">
                      {/* Stylized QR Code with simulated scan laser */}
                      <div className="w-44 h-44 bg-white flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Simulated QR Graphic */}
                        <svg viewBox="0 0 100 100" className="w-full h-full p-1 text-slate-900 fill-current">
                          {/* Top-left marker */}
                          <rect x="5" y="5" width="26" height="26" rx="4" fill="#0c2340" />
                          <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                          <rect x="13" y="13" width="10" height="10" rx="1" fill="#0c2340" />
                          {/* Top-right marker */}
                          <rect x="69" y="5" width="26" height="26" rx="4" fill="#0c2340" />
                          <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                          <rect x="77" y="13" width="10" height="10" rx="1" fill="#0c2340" />
                          {/* Bottom-left marker */}
                          <rect x="5" y="69" width="26" height="26" rx="4" fill="#0c2340" />
                          <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                          <rect x="13" y="77" width="10" height="10" rx="1" fill="#0c2340" />
                          {/* Data points */}
                          <rect x="36" y="8" width="8" height="8" fill="#0c2340" />
                          <rect x="48" y="12" width="6" height="14" fill="#0c2340" />
                          <rect x="38" y="24" width="8" height="6" fill="#0c2340" />
                          <rect x="8" y="38" width="14" height="6" fill="#0c2340" />
                          <rect x="26" y="40" width="8" height="16" fill="#0c2340" />
                          <rect x="40" y="36" width="20" height="20" rx="4" fill="#2563eb" />
                          {/* Center UPI icon */}
                          <circle cx="50" cy="46" r="6" fill="#ffffff" />
                          <rect x="66" y="38" width="12" height="8" fill="#0c2340" />
                          <rect x="82" y="42" width="10" height="12" fill="#0c2340" />
                          <rect x="38" y="62" width="14" height="8" fill="#0c2340" />
                          <rect x="58" y="66" width="16" height="10" fill="#0c2340" />
                          <rect x="78" y="60" width="14" height="14" fill="#0c2340" />
                          <rect x="38" y="76" width="12" height="16" fill="#0c2340" />
                          <rect x="56" y="82" width="20" height="10" fill="#0c2340" />
                          <rect x="82" y="78" width="10" height="14" fill="#0c2340" />
                        </svg>

                        {/* Animated Scanning Beam */}
                        <motion.div
                          animate={{ y: [-70, 70, -70] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-lg shadow-blue-500/80"
                        />
                      </div>

                      {/* Small badge */}
                      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow">
                        UPI QR
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-300 font-medium">
                        Scan with Google Pay, PhonePe, Paytm, CRED or any UPI App
                      </p>
                      <p className="text-[11px] text-slate-500">
                        QR Code expires in <span className="text-amber-400 font-mono font-bold">{formatTimer(countdown)}</span>
                      </p>
                    </div>

                    {/* Simulate Button for seamless desktop/mobile test */}
                    <button
                      onClick={() => executeSimulatedPayment(false)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <Sparkles size={16} className="text-amber-300" />
                      <span>Simulate UPI QR Scan & Pay ({formattedINR})</span>
                    </button>
                  </div>
                )}

                {/* TAB 2: UPI APPS */}
                {activeTab === 'apps' && (
                  <div className="space-y-4 pt-1">
                    <p className="text-xs text-slate-400 text-center">
                      Select your preferred UPI app to simulate direct intent authorization:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {upiApps.map((app) => (
                        <button
                          key={app.name}
                          type="button"
                          onClick={() => setSelectedApp(app.name)}
                          className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                            selectedApp === app.name
                              ? 'bg-blue-600/10 border-blue-500 text-white'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{app.icon}</span>
                            <div className="text-left">
                              <span className="font-bold text-xs block">{app.name}</span>
                              <span className="text-[10px] text-slate-500">Instant UPI</span>
                            </div>
                          </div>
                          {selectedApp === app.name && (
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => executeSimulatedPayment(false)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <span>Pay {formattedINR} via {selectedApp}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                {/* TAB 3: UPI ID / VPA */}
                {activeTab === 'upi_id' && (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-bold text-slate-400 block">
                        Enter UPI ID / VPA
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. success@razorpay or mobile@upi"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-2.5 pl-3 pr-20 text-xs text-slate-100 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Quick test chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Quick Test Handles:</span>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setUpiId('success@razorpay')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg cursor-pointer transition font-mono border border-emerald-500/20"
                        >
                          success@razorpay
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiId('rajesh@okhdfcbank')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition font-mono"
                        >
                          user@okhdfcbank
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiId('failure@razorpay')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-red-300 rounded-lg cursor-pointer transition font-mono border border-red-500/20"
                        >
                          failure@razorpay (Test Decline)
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      A payment request will be simulated to this UPI ID without deducting any real money.
                    </p>

                    <button
                      onClick={() => executeSimulatedPayment(upiId.includes('fail'))}
                      disabled={!upiId.trim()}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                    >
                      <span>Verify & Pay {formattedINR}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. PROCESSING STATE - Realistic Simulation Sequence */}
            {paymentState === 'processing' && (
              <div className="py-8 px-4 flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-blue-400 font-extrabold text-xs">
                    UPI
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-base text-white">Processing UPI Transaction</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Please approve the payment request on your UPI app or wait while sandbox test verifies.
                  </p>
                </div>

                {/* Stepper feedback */}
                <div className="w-full max-w-xs space-y-2.5 text-xs text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-slate-300">Connecting to UPI Payment Server</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {processingStep >= 2 ? (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    ) : (
                      <Loader2 size={14} className="text-blue-400 animate-spin" />
                    )}
                    <span className={processingStep >= 2 ? 'text-slate-300' : 'text-slate-500'}>
                      Awaiting UPI Authorization (Sandbox)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {processingStep >= 3 ? (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700"></div>
                    )}
                    <span className={processingStep >= 3 ? 'text-slate-300' : 'text-slate-600'}>
                      Verifying Razorpay Order Signature
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-amber-300 font-medium">
                  🧪 Test Mode: Simulating success without money transfer.
                </p>
              </div>
            )}

            {/* 3. SUCCESS STATE */}
            {paymentState === 'success' && (
              <div className="py-8 px-4 flex flex-col items-center text-center space-y-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20"
                >
                  <CheckCircle2 size={36} />
                </motion.div>

                <div className="space-y-1.5">
                  <h4 className="font-black text-lg text-white">Payment Successful!</h4>
                  <p className="text-xs text-slate-300">
                    Your UPI payment of <span className="text-emerald-400 font-bold">{formattedINR}</span> was authorized successfully.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Razorpay Test Payment ID: pay_{Math.random().toString(36).substring(2, 10)}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Finalizing order and redirecting...</span>
                </div>
              </div>
            )}

            {/* 4. FAILED STATE */}
            {paymentState === 'failed' && (
              <div className="py-8 px-4 flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/20">
                  <AlertCircle size={36} />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-lg text-white">Payment Failed</h4>
                  <p className="text-xs text-slate-400">
                    {errorMessage || 'Transaction could not be completed.'}
                  </p>
                </div>

                <button
                  onClick={() => setPaymentState('idle')}
                  className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Try Again</span>
                </button>
              </div>
            )}
          </div>

          {/* Razorpay Footer */}
          <div className="bg-slate-950 px-6 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-500" />
              <span>Secured by 256-bit Razorpay Encryption</span>
            </div>
            <span className="font-semibold text-slate-400">ShopEZ Payments</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default RazorpayModal;
