import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { formatXRP } from '../lib/utils';
import { Gift, Calendar, CheckCircle2, Sparkles, Award } from 'lucide-react';

export default function DailyCheckIn() {
  const { user, refreshUser } = useAuth();
  const state = store.getState();
  const rewards = state.dailyRewards || [2, 5, 10, 15, 20, 30, 50];

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check last check in from local storage or lastMiningDate
  const todayStr = new Date().toISOString().slice(0, 10);
  const lastCheckInDate = localStorage.getItem(`novax_checkin_${user?.id}`);
  const hasClaimedToday = lastCheckInDate === todayStr;

  const currentStreak = Number(localStorage.getItem(`novax_streak_${user?.id}`) || '0');
  const rewardToday = rewards[currentStreak % rewards.length] || 2;

  const handleClaim = async () => {
    if (!user) return;
    if (hasClaimedToday) {
      setMsg({ text: 'You have already collected today’s bonus! Come back tomorrow.', type: 'error' });
      return;
    }

    setLoading(true);
    setMsg(null);
    try {
      const newStreak = (currentStreak + 1);
      const bonusAmount = rewardToday;

      await store.updateUser(user.id, {
        balance: (user.balance || 0) + bonusAmount,
        totalEarnings: (user.totalEarnings || 0) + bonusAmount,
      });

      await store.addTransaction({
        userId: user.id,
        username: user.username,
        type: 'bonus',
        amount: bonusAmount,
        status: 'completed',
        description: `Daily Check-In Day ${newStreak} Bonus`,
      });

      localStorage.setItem(`novax_checkin_${user.id}`, todayStr);
      localStorage.setItem(`novax_streak_${user.id}`, String(newStreak));

      await refreshUser();
      setMsg({
        text: `Claimed +${formatXRP(bonusAmount)} Daily Bonus successfully! Keep up the streak!`,
        type: 'success'
      });
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to claim daily bonus', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-6">
      <div className="glass-panel p-5 rounded-3xl bg-gradient-to-br from-[#FF007A]/15 via-[var(--color-bg-card)] to-brand-gold/15 border border-[#FF007A]/30 shadow-xl text-center">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-[#FF007A]/20 flex items-center justify-center text-[#FF007A] mb-3 border border-[#FF007A]/40 shadow-lg">
          <Gift size={28} />
        </div>
        <h1 className="text-lg font-bold text-white">Daily Sign-In Bonus</h1>
        <p className="text-xs text-text-muted mt-1">Check in continuously every 24 hours to earn higher rewards</p>

        <div className="mt-4 p-3 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-around text-xs">
          <div>
            <div className="text-[10px] text-text-muted">Current Streak</div>
            <div className="font-bold text-white text-sm mt-0.5">{currentStreak} Days</div>
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <div>
            <div className="text-[10px] text-text-muted">Today's Reward</div>
            <div className="font-bold text-[#FF007A] text-sm mt-0.5">+{formatXRP(rewardToday)}</div>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-2xl text-xs text-center border ${
          msg.type === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Streak 7-day grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {rewards.slice(0, 7).map((amount, idx) => {
          const dayNum = idx + 1;
          const isDone = (currentStreak % 7) >= dayNum || (hasClaimedToday && (currentStreak % 7 === 0 && dayNum === 7));
          const isToday = !hasClaimedToday && (currentStreak % 7) + 1 === dayNum;

          return (
            <div
              key={dayNum}
              className={`p-2.5 rounded-2xl text-center border transition-all ${
                isDone
                  ? 'bg-green-500/10 border-green-500/30 opacity-70'
                  : isToday
                  ? 'bg-[#FF007A]/20 border-[#FF007A] shadow-[0_0_15px_rgba(255,0,122,0.3)]'
                  : 'bg-[var(--color-bg-card)] border-[var(--color-border-card)]'
              }`}
            >
              <div className="text-[10px] text-text-muted font-bold">Day {dayNum}</div>
              <div className="my-1">
                {isDone ? (
                  <CheckCircle2 size={18} className="mx-auto text-green-400" />
                ) : (
                  <Sparkles size={18} className={`mx-auto ${isToday ? 'text-[#FF007A]' : 'text-text-muted'}`} />
                )}
              </div>
              <div className="text-[10px] font-bold text-white">+{amount} XRP</div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleClaim}
        disabled={loading || hasClaimedToday}
        className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
          hasClaimedToday
            ? 'bg-white/10 text-text-muted cursor-not-allowed border border-white/5'
            : 'bg-gradient-to-r from-[#FF007A] to-brand-gold text-black hover:opacity-90 active:scale-95 shadow-[#FF007A]/20'
        }`}
      >
        {loading ? (
          'Processing...'
        ) : hasClaimedToday ? (
          'Collected Today ✓'
        ) : (
          `Claim Today's Bonus (+${rewardToday} XRP)`
        )}
      </button>
    </div>
  );
}
