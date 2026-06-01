import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { loginStart, loginFailure, onLoginSuccess } from '../redux/slices/authSlice';
import { authAPI } from '../services/api';
import { BRAND } from '../utils/constants';
import { auth, googleProvider, signInWithPopup } from '../utils/firebase';
import toast from 'react-hot-toast';

const getFirebaseGoogleErrorMessage = (error) => {
  if (error?.code === 'auth/operation-not-allowed') {
    return 'Google sign-in is disabled in Firebase. Enable Google under Authentication > Sign-in method, and make sure this app domain is listed in Authorized domains.';
  }

  if (error?.code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized for Firebase Auth. Add the current domain to Authentication > Settings > Authorized domains.';
  }

  return error?.message || 'Google sign-in failed.';
};

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const getTargetPath = (user) => {
    if (location.state?.from?.pathname) return location.state.from.pathname;
    return user.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/dashboard';
  };

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      if (isLogin) {
        const response = await authAPI.login({ email: data.email, password: data.password });
        const { user } = response.data;

        dispatch(onLoginSuccess(user));
        toast.success(`Welcome back, ${user.name}!`, {
          style: { background: '#1E2B24', color: '#F5EFE4', borderRadius: '12px', border: '1px solid rgba(201,166,107,0.3)' }
        });

        const targetPath = getTargetPath(user);
        navigate(targetPath, { replace: true });
      } else {
        const response = await authAPI.register({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
        });
        
        dispatch(loginFailure(null)); // just to stop loading state
        toast.success(response.message || 'Registration successful! Please check your email (and spam folder) to verify your account.', {
          duration: 5000,
        });
        setIsLogin(true);
        reset();
      }
    } catch (error) {
      dispatch(loginFailure(error.message));
      toast.error(error.message || 'Authentication failed');
    }
  };

  const handleGoogleLogin = async () => {
    dispatch(loginStart());
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await authAPI.firebaseLogin({ idToken });
      const { user } = response.data;

      dispatch(onLoginSuccess(user));
      toast.success(`Welcome, ${user.name}!`, {
        style: { background: '#1E2B24', color: '#F5EFE4', borderRadius: '12px', border: '1px solid rgba(201,166,107,0.3)' }
      });

      const targetPath = getTargetPath(user);
      navigate(targetPath, { replace: true });
    } catch (error) {
      const message = getFirebaseGoogleErrorMessage(error);
      dispatch(loginFailure(message));
      toast.error(message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <>
      <Helmet>
        <title>{`${isLogin ? 'Login' : 'Sign Up'} | SAVORA`}</title>
      </Helmet>

      <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex flex-col items-center group mb-8">
            <span className="font-heading text-4xl font-bold tracking-wider text-forest group-hover:text-gold transition-colors">{BRAND.name}</span>
            <span className="text-xs tracking-[0.3em] text-olive font-body uppercase mt-1">{BRAND.tagline}</span>
          </Link>
          <h2 className="mt-2 text-center font-heading text-3xl font-bold text-forest">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="mt-2 text-center text-sm font-body text-olive">
            {isLogin ? 'Sign in to access your account' : 'Join us to experience authentic flavors'}
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-3xl sm:px-10 premium-shadow-lg gold-border">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {!isLogin && (
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="h-4 w-4 text-olive/50" />
                    </div>
                    <input {...register('name', { required: !isLogin ? 'Name is required' : false })} className="block w-full pl-11 pr-4 py-3 border border-gold/20 rounded-xl bg-cream focus:ring-gold focus:border-gold sm:text-sm font-body outline-none" placeholder="John Doe" />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500 font-body">{errors.name.message}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-body font-medium text-forest mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="h-4 w-4 text-olive/50" />
                  </div>
                  <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })} type="email" className="block w-full pl-11 pr-4 py-3 border border-gold/20 rounded-xl bg-cream focus:ring-gold focus:border-gold sm:text-sm font-body outline-none" placeholder="you@example.com" />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 font-body">{errors.email.message}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-body font-medium text-forest mb-1.5">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiPhone className="h-4 w-4 text-olive/50" />
                    </div>
                    <input {...register('phone')} type="tel" className="block w-full pl-11 pr-4 py-3 border border-gold/20 rounded-xl bg-cream focus:ring-gold focus:border-gold sm:text-sm font-body outline-none" placeholder="+91 9876543210" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-body font-medium text-forest mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-olive/50" />
                  </div>
                  <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} type={showPassword ? 'text' : 'password'} className="block w-full pl-11 pr-10 py-3 border border-gold/20 rounded-xl bg-cream focus:ring-gold focus:border-gold sm:text-sm font-body outline-none" placeholder="••••••••" />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-olive/50 hover:text-forest" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </div>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500 font-body">{errors.password.message}</p>}
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-gold focus:ring-gold border-gold/30 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-xs font-body text-olive">Remember me</label>
                  </div>
                  <div className="text-xs font-body">
                    <a href="#" className="font-medium text-gold hover:text-gold-dark">Forgot password?</a>
                  </div>
                </div>
              )}

              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-body font-semibold text-cream bg-forest hover:bg-forest-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gold/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-olive">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 rounded-xl border border-gold/20 bg-cream text-sm font-medium text-forest hover:bg-gold/10 transition-colors"
                >
                  <FcGoogle className="h-5 w-5 mr-2" />
                  Google
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1 text-sm font-body">
              <span className="text-olive">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
              <button onClick={toggleMode} className="font-semibold text-gold hover:text-gold-dark transition-colors">
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
