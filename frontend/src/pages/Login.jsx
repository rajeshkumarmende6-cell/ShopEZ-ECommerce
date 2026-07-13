import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginRole, setLoginRole] = useState('customer');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Prefill default customer credentials on mount
  useEffect(() => {
    setValue('email', 'user@shopez.com');
    setValue('password', 'password123');
  }, [setValue]);

  const handleRoleSelect = (role) => {
    setLoginRole(role);
    if (role === 'admin') {
      setValue('email', 'admin@shopez.com');
      setValue('password', 'password123');
    } else {
      setValue('email', 'user@shopez.com');
      setValue('password', 'password123');
    }
  };

  // Redirect path after login
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await login(data.email, data.password);
    setIsSubmitting(false);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative gradient glowing circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center space-y-2 mb-6">
          <Link to="/" className="inline-block text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            ShopEZ
          </Link>
          <h2 className="text-xl font-bold text-slate-200">Welcome Back</h2>
          <p className="text-slate-400 text-sm">
            {loginRole === 'admin' 
              ? 'Access the shop control center and dashboards' 
              : 'Sign in to browse and buy premium items'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-700/50 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('customer')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
              loginRole === 'customer'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow-md shadow-violet-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
              loginRole === 'admin'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow-md shadow-violet-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Administrator
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full bg-slate-900/80 border ${
                  errors.email ? 'border-red-500/80 focus:ring-red-500/30' : 'border-slate-700 focus:ring-violet-500/30'
                } rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:border-violet-500/80 transition`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-400 font-medium pl-1">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-violet-400 hover:text-violet-300 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full bg-slate-900/80 border ${
                  errors.password ? 'border-red-500/80 focus:ring-red-500/30' : 'border-slate-700 focus:ring-violet-500/30'
                } rounded-xl py-3 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:border-violet-500/80 transition`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-400 font-medium pl-1">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-violet-950/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center text-sm text-slate-400">
          New to ShopEZ?{' '}
          <Link
            to="/register"
            className="text-violet-400 hover:text-violet-300 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
