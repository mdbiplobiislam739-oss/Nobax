import { ArrowLeft, Trophy, Users, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { store } from '../lib/store';
import { formatXRP } from '../lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'earnings' | 'referrals'>('earnings');

  const users = store.getState().users;

  // Real Top by balance (No fake numbers)
  const topEarners = [...users].sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 10);
  
  // Real Top by referrals
  const aggregatedReferrals = [...users].map(u => {
    const refs = users.filter(sub => sub.referrerId === u.id);
    return { ...u, refCount: refs.length };
  });

  const topReferrers = [...aggregatedReferrals].sort((a, b) => (b.refCount || 0) - (a.refCount || 0)).slice(0, 10);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center border border-[var(--color-border-card)]">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">{t('Leaderboard')}</h1>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-card)]">
        <button
          onClick={() => setTab('earnings')}
          className={`py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            tab === 'earnings' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted hover:text-white'
          }`}
        >
          <Trophy size={16} /> Top Earners
        </button>
        <button
          onClick={() => setTab('referrals')}
          className={`py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            tab === 'referrals' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted hover:text-white'
          }`}
        >
          <Users size={16} /> Top Invites
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {tab === 'earnings' ? (
          topEarners.length === 0 ? (
            <div className="text-center py-10 text-text-muted text-sm">No members yet</div>
          ) : (
            topEarners.map((user, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={user.id}
                className="glass-panel p-4 rounded-xl flex items-center justify-between border-[var(--color-border-card)] bg-[var(--color-bg-card)]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/40' :
                    idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/40' :
                    idx === 2 ? 'bg-amber-600/20 text-amber-600 border border-amber-600/40' :
                    'text-text-muted bg-white/5'
                  }`}>
                    {idx < 3 ? <Medal size={16} /> : idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{user.username}</div>
                    <div className="text-[10px] text-text-muted">Member</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-brand-gold text-sm">+{formatXRP(user.balance || 0)} XRP</div>
                  <div className="text-[10px] text-text-muted">Balance</div>
                </div>
              </motion.div>
            ))
          )
        ) : (
          topReferrers.length === 0 ? (
            <div className="text-center py-10 text-text-muted text-sm">No invites yet</div>
          ) : (
            topReferrers.map((user, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={user.id}
                className="glass-panel p-4 rounded-xl flex items-center justify-between border-[var(--color-border-card)] bg-[var(--color-bg-card)]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/40' :
                    idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/40' :
                    idx === 2 ? 'bg-amber-600/20 text-amber-600 border border-amber-600/40' :
                    'text-text-muted bg-white/5'
                  }`}>
                    {idx < 3 ? <Medal size={16} /> : idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{user.username}</div>
                    <div className="text-[10px] text-text-muted">Member</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-brand-primary text-sm">{user.refCount || 0} Invites</div>
                  <div className="text-[10px] text-text-muted">Total Team</div>
                </div>
              </motion.div>
            ))
          )
        )}
      </div>
    </div>
  );
}
