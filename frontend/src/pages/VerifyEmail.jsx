import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyEmail() {
  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const effectRan = useRef(false);

  useEffect(() => {
    // Avoid double API trigger on React 18/19 strict mode double mounting
    if (effectRan.current) return;
    effectRan.current = true;

    const triggerVerification = async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setMessage(result.message || 'Verification link is invalid or has expired.');
      }
    };
    triggerVerification();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 relative">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl text-center space-y-6">
        <Link to="/" className="inline-block text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          ShopEZ
        </Link>

        {status === 'verifying' && (
          <div className="py-6 space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-violet-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-200">Verifying Email</h2>
            <p className="text-slate-400 text-sm">Please wait while we confirm your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-200">Email Verified!</h2>
            <p className="text-slate-400 text-sm">
              Your email address has been successfully verified. You can now access all features.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="inline-block w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-violet-950/20"
              >
                Go to Dashboard / Store
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 space-y-4">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-200">Verification Failed</h2>
            <p className="text-slate-400 text-sm">
              {message}
            </p>
            <div className="pt-4 flex flex-col space-y-3">
              <Link
                to="/login"
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-3 px-6 rounded-xl transition"
              >
                Return to Login
              </Link>
              <Link to="/" className="text-violet-400 hover:text-violet-300 text-sm hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
