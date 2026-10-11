import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, Gift, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import novaxLogo from '../assets/images/novax_logo_1782982838843.jpg';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [refCode, setRefCode] = useState(() => localStorage.getItem('refCode') || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const cleanEmail = email.trim();
    const isOwner = cleanEmail.toLowerCase() === 'mdbiplobiislam739@gmail.com';

    if (isOwner && password !== 'biplobBIPLOB12') {
      setError('ওনার অ্যাকাউন্টের নির্দিষ্ট পাসওয়ার্ড হলো biplobBIPLOB12');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(cleanEmail, username.trim(), password, phone.trim(), refCode.trim());
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-4 bg-[var(--color-bg-base)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-gold/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-screen md:h-auto md:max-w-[420px] bg-[var(--color-bg-card)] md:glass-panel p-6 sm:p-8 md:rounded-3xl relative z-10 flex flex-col justify-center overflow-y-auto"
      >
        <div className="flex flex-col items-center mb-5">
          <div className="relative mb-3 group">
            <img
              src={novaxLogo}
              alt="NovaX"
              onError={(e) => { e.currentTarget.src = '/novax_logo.jpg'; }}
              className="w-20 h-20 rounded-2xl object-cover shadow-[0_0_20px_rgba(255,90,0,0.5)] border-2 border-brand-primary/50 transition-transform group-hover:scale-105"
            />
            <div className="absolute -bottom-2 -right-1 px-2.5 py-0.5 bg-gradient-to-r from-brand-primary to-brand-gold text-black text-[10px] font-black rounded-full uppercase tracking-wider shadow-md">
              NovaX
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-text-muted mt-0.5 text-xs">Join NovaX Official Platform</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-xl mb-4 text-xs text-center border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-text-muted mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-text-muted mb-1 block">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-text-muted mb-1 block">Phone (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880..."
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-text-muted mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-text-muted mb-1 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-text-muted mb-1 block">Invitation Code (Optional)</label>
            <div className="relative">
              <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="text"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                placeholder="Referral Code"
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-gold text-black font-bold rounded-xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 text-xs shadow-lg shadow-brand-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Register Account <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-text-muted text-xs mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary hover:underline font-semibold">
            Log in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
