import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { formatXRP } from '../lib/utils';
import { Zap, Lock, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const STAKE_POOLS = [
  { days: 7, apy: 15, name: '7-Day Flexible Pool', min: 20 },
  { days: 30, apy: 35, name: '30-Day Growth Vault', min: 50 },
  { days: 90, apy: 70, name: '90-Day VIP Staking', min: 100 },
  { days: 180, apy: 120, name: '180-Day Diamond Vault', min: 500 },
];

export default function Staking() {
  const { user, refreshUser } = useAuth();
  const [selectedPool, setSelectedPool] = useState(STAKE_POOLS[1]);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const state = store.getState();
  const myStakes = (state.stakes || []).filter(s => s.userId === user?.id);

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < selectedPool.min) {
      setMsg({ text: `Minimum stake for this pool is ${formatXRP(selectedPool.min)}`, type: 'error' });
      return;
    }

    if (user.balance < numAmount) {
      setMsg({ text: `Insufficient balance. Available: ${formatXRP(user.balance)}`, type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMsg(null);
    try {
      const reward = Number((numAmount * (selectedPool.apy / 100) * (selectedPool.days / 365)).toFixed(2));
      const now = Date.now();
      const end = now + selectedPool.days * 86400 * 1000;

      await store.updateUser(user.id, {
        balance: user.balance - numAmount,
      });

      await store.addStake({
        userId: user.id,
        amount: numAmount,
        durationDays: selectedPool.days,
        interestRate: selectedPool.apy,
        startDate: now,
        endDate: end,
        status: 'active',
        reward: reward,
      });

      await store.addTransaction({
        userId: user.id,
        username: user.username,
        type: 'stake',
        amount: numAmount,
        status: 'completed',
        description: `Staked in ${selectedPool.name}`,
      });

      await refreshUser();
      setAmount('');
      setMsg({
        text: `Successfully locked ${formatXRP(numAmount)} in ${selectedPool.name}! Estimated profit: +${formatXRP(reward)}.`,
        type: 'success'
      });
    } catch (err: any) {
      setMsg({ text: err.message || 'Staking failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-6">
      <div className="glass-panel p-5 rounded-3xl bg-gradient-to-br from-[#fcd535]/15 via-[var(--color-bg-card)] to-brand-primary/10 border border-[#fcd535]/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#fcd535]/20 flex items-center justify-center text-[#fcd535] border border-[#fcd535]/40">
            <Zap size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">XRP High-Yield Staking</h1>
            <p className="text-[11px] text-text-muted">Lock crypto to earn daily automated returns</p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
          <span className="text-text-muted">Available Balance:</span>
          <span className="font-bold text-[#fcd535]">{formatXRP(user?.balance || 0)}</span>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-2xl text-xs text-center border ${
          msg.type === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Select Pools */}
      <div className="grid grid-cols-2 gap-2">
        {STAKE_POOLS.map((pool) => {
          const isSelected = selectedPool.days === pool.days;
          return (
            <button
              key={pool.days}
              type="button"
              onClick={() => setSelectedPool(pool)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#fcd535]/15 border-[#fcd535] shadow-lg'
                  : 'bg-[var(--color-bg-card)] border-[var(--color-border-card)] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{pool.days} Days</span>
                <span className="font-black text-[#fcd535] text-xs">+{pool.apy}% APY</span>
              </div>
              <div className="text-[10px] text-text-muted mt-1 truncate">{pool.name}</div>
              <div className="text-[9px] text-text-muted mt-0.5">Min: {formatXRP(pool.min)}</div>
            </button>
          );
        })}
      </div>

      {/* Staking Form */}
      <form onSubmit={handleStake} className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)] space-y-3">
        <div>
          <label className="text-[11px] font-semibold text-text-muted mb-1 block">Stake Amount (XRP)</label>
          <div className="relative">
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${selectedPool.min} XRP`}
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-card)] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#fcd535]"
            />
            <button
              type="button"
              onClick={() => setAmount(String(user?.balance || 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold text-white"
            >
              MAX
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#fcd535] to-brand-primary text-black font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : `Stake Now (${selectedPool.days} Days)`}
        </button>
      </form>

      {/* Active Stakes */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5 px-1">
          <Clock size={14} className="text-[#fcd535]" /> My Locked Stakes ({myStakes.length})
        </h3>
        {myStakes.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border-card)] text-center text-text-muted text-xs">
            No active stakes. Lock XRP to start earning daily interest!
          </div>
        ) : (
          myStakes.map((stake) => (
            <div
              key={stake.id}
              className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Lock size={12} className="text-[#fcd535]" />
                  {formatXRP(stake.amount)} Locked
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  Est. Profit: +{formatXRP(stake.reward)} ({stake.interestRate}% APY)
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold uppercase">
                  Active
                </span>
                <div className="text-[9px] text-text-muted mt-1">
                  Matures: {new Date(stake.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
