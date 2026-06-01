import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginStart, loginFailure, onLoginSuccess } from '../../redux/slices/authSlice';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // If already logged in as admin, redirect to dashboard
  if (isAuthenticated && user?.role?.toUpperCase() === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const response = await authAPI.login({ email: data.email, password: data.password });
      const { user, token } = response.data;

      if (user.role?.toUpperCase() !== 'ADMIN') {
        dispatch(loginFailure('Access denied. Admin privileges required.'));
        toast.error('Access denied. Admin privileges required.');
        // Don't auto-redirect to protect admin route visibility, just reject
        return;
      }

      dispatch(onLoginSuccess(user));
      toast.success(`Welcome back Admin, ${user.name}!`);
      
      navigate('/admin', { replace: true });
    } catch (error) {
      dispatch(loginFailure(error.message));
      toast.error(error.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-olive/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <Helmet>
        <title>Admin Portal | Savora</title>
      </Helmet>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-forest/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="max-w-md w-full relative">
        <div className="bg-white rounded-3xl premium-shadow border border-gold/20 p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-forest mb-2">
              Admin Portal
            </h1>
            <p className="text-olive/70 font-body text-sm">
              Secure access to Savora management
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-forest mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-olive/40" />
                </div>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`block w-full pl-11 pr-4 py-3 placeholder-olive/30 border ${
                    errors.email ? 'border-red-500 focus:ring-red-500 ' : 'border-gold/30 hover:border-gold/50 focus:ring-forest/20'
                  } rounded-xl focus:outline-none focus:ring-4 bg-white transition-all`}
                  placeholder="admin@savora.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-forest mb-2">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-olive/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className={`block w-full pl-11 pr-12 py-3 placeholder-olive/30 border ${
                    errors.password ? 'border-red-500 focus:ring-red-500 ' : 'border-gold/30 hover:border-gold/50 focus:ring-forest/20'
                  } rounded-xl focus:outline-none focus:ring-4 bg-white transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-olive/40 hover:text-forest transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-olive/40 hover:text-forest transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-forest hover:bg-forest-light focus:outline-none focus:ring-4 focus:ring-forest/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative font-heading tracking-wide flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </span>
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-olive/50">
            <p>Protected area. Unauthorized access is strictly prohibited.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;