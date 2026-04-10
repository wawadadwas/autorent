import React, { useState } from 'react';
import { LogIn, Car, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        window.location.href = '/admin';
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        toast.success('Account created! Sign in to continue.', {
          icon: '🚀',
        });
        setIsLogin(true);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-xl overflow-hidden"
      >
        <div className="flex justify-center mb-6 text-primary">
          <Car className="h-12 w-12" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: isLogin ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 30 : -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-2xl font-bold text-center mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {isLogin ? 'Enter your credentials to access your account' : 'Sign up to reserve premium vehicles'}
            </p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="admin@autorent.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 text-white bg-zinc-950 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : <>{isLogin ? <LogIn className="mr-2 h-4 w-4"/> : <UserPlus className="mr-2 h-4 w-4"/>} {isLogin ? 'Sign In' : 'Sign Up'}</>}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setError(null); }} 
                className="text-zinc-950 hover:text-black font-bold underline decoration-zinc-300 underline-offset-4 cursor-pointer transition-colors"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
