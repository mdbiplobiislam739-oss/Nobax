import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { store } from '../lib/store';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import novaxLogo from '../assets/images/novax_logo_1782982838843.jpg';

export default function Login() {
  const [email, setEmail] = useState('mdbiplobiislam739@gmail.com');
  const [password, setPassword] = useState('biplobBIPLOB12');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMsg('');
    const cleanEmail = email.trim();
    
    // Attempt authentication via Firebase
    try {
      await login(cleanEmail, password);
      if (isOwner && password === 'biplobBIPLOB12') {
        sessionStorage.setItem('novax_owner_unlocked', 'true');
      }
    } catch (e: any) {
      setError(e.message || 'Login failed. Please check your credentials and retry.');
    }
    setIsSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setError('');
      setMsg('Password reset link sent to your email.');
    } catch (e: any) {
      setError(e.message || 'Error sending password reset email.');
      setMsg('');
    }
  };

  const isOwner = email.trim().toLowerCase() === 'mdbiplobiislam739@gmail.com';

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4 bg-[var(--color-bg-base)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-gold/10 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-screen md:h-auto md:max-w-[400px] bg-[var(--color-bg-card)] md:glass-panel p-8 md:rounded-3xl relative z-10 flex flex-col justify-center"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3 group">
            <img 
              src={novaxLogo} 
              alt="NovaX" 
              onError={(e) => { e.currentTarget.src = '/novax_logo.jpg'; }}
              className="w-24 h-24 rounded-3xl object-cover shadow-[0_0_25px_rgba(255,90,0,0.6)] border-2 border-brand-primary/50 transition-transform group-hover:scale-105" 
            />
            <div className="absolute -bottom-2 -right-1 px-2.5 py-0.5 bg-gradient-to-r from-brand-primary to-brand-gold text-black text-[10px] font-black rounded-full uppercase tracking-wider shadow-md">
              NovaX
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-text-muted mt-1 text-xs">Sign in to your NovaX Account</p>
          {isOwner && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-semibold">
              <span>👑</span> Verified Platform Owner
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-xl mb-4 text-xs text-center border border-red-500/20">
            {error}
          </div>
        )}

        {msg && (
          <div className="bg-green-500/10 text-green-500 p-3 rounded-xl mb-4 text-xs text-center border border-green-500/20">
            {msg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="email"
                placeholder="Enter email"
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-medium text-text-muted">Password</label>
              {isOwner && (
                <span className="text-[10px] text-brand-gold font-medium">Owner Access</span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-primary hover:bg-[#ff6e1a] text-white font-bold py-3.5 rounded-xl text-base active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/25 mt-3 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing In...' : isOwner ? 'Sign In as Owner' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-muted flex flex-col gap-2.5">
          <span>
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-primary font-medium hover:underline">
              Register now
            </Link>
          </span>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-text-muted hover:text-brand-primary transition-colors text-xs"
          >
            Forgot Password? Reset via Email
          </button>
          <a
            href={store.getState().supportLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-brand-primary transition-colors text-xs"
          >
            Contact 24/7 Support
          </a>
        </p>
      </motion.div>
    </div>
  );
}
