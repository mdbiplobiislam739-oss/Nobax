import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { store, VIP_LEVELS } from '../lib/store';
import { formatXRP, cn } from '../lib/utils';
import { playSuccessSound } from '../lib/audio';
import {
  Crown,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VIP() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [upgradingLevel, setUpgradingLevel] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((prev) => prev + 1);
    window.addEventListener('store_updated', handleUpdate);
    return () => window.removeEventListener('store_updated', handleUpdate);
  }, []);

  const currentLevel = user?.vipLevel || 0;
  const currentTierData = VIP_LEVELS.find((l) => l.level === currentLevel) || VIP_LEVELS[0];

  const handleUpgradeVIP = async (targetLevel: number) => {
    if (!user) return;
    const targetData = VIP_LEVELS.find((l) => l.level === targetLevel);
    if (!targetData) return;

    if (targetLevel <= currentLevel) {
      setMsg({ text: `You already unlocked VIP ${targetLevel}!`, type: 'success' });
      return;
    }

    if (user.balance < targetData.price) {
      setMsg({
        text: `Insufficient balance (${formatXRP(user.balance)} / ${formatXRP(targetData.price)}). Please deposit XRP to upgrade.`,
        type: 'error',
      });
      return;
    }

    setUpgradingLevel(targetLevel);
    setMsg(null);
    try {
      const newBal = user.balance - targetData.price;
      await store.updateUser(user.id, {
        vipLevel: targetLevel,
        balance: newBal,
      });
      await refreshUser();
      playSuccessSound();
      setMsg({
        text: `Congratulations! Successfully upgraded to ${targetData.name}!`,
        type: 'success',
      });
    } catch (err: any) {
      setMsg({ text: err.message || 'Upgrade failed', type: 'error' });
    } finally {
      setUpgradingLevel(null);
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-20">
      {/* Top Banner: Dedicated VIP Club */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c162d] via-[#091124] to-[#040915] border border-brand-gold/40 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/40 inline-flex items-center gap-1.5">
              <Crown size={12} />
              VIP MEMBERSHIP CLUB
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>VIP Tier Privileges & Benefits</span>
            </h1>
            <p className="text-xs text-text-muted max-w-md leading-relaxed">
              Ascend VIP ranks to unlock increased daily task limits, automated rebate multipliers, priority settlements, and VIP rewards.
            </p>
          </div>

          <div className="bg-black/60 border border-slate-700/60 rounded-2xl p-3.5 shrink-0 min-w-[130px] text-right shadow-lg">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <Award size={13} className="text-brand-gold" />
              <span className="text-[10px] font-bold text-brand-gold uppercase">Current Tier</span>
            </div>
            <div className="text-base font-black text-white font-mono">
              VIP {currentLevel} • {currentTierData.name}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              Daily: <span className="text-emerald-400 font-bold">{formatXRP(currentTierData.dailyIncome)}</span>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={cn(
            'p-3 rounded-2xl text-xs text-center border font-bold flex items-center justify-center gap-2 shadow-lg',
            msg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          )}
        >
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* VIP Tiers List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-brand-gold" />
            <span>Membership Ranks & Requirements</span>
          </h2>
          <span className="text-[10px] text-text-muted">Total 9 VIP Ranks</span>
        </div>

        {VIP_LEVELS.map((level) => {
          const isCurrent = currentLevel === level.level;
          const isUnlocked = currentLevel >= level.level;
          const canUpgrade = currentLevel < level.level;

          return (
            <div
              key={level.level}
              className={cn(
                'p-4 rounded-2xl transition-all border relative overflow-hidden shadow-lg',
                isCurrent
                  ? 'bg-gradient-to-r from-brand-gold/15 via-[#0b1526] to-transparent border-brand-gold/70 shadow-[0_0_25px_rgba(255,200,0,0.15)] ring-1 ring-brand-gold/30'
                  : isUnlocked
                  ? 'bg-[#0b1526]/80 border-slate-800 opacity-75'
                  : 'bg-[#0b1526]/60 border-slate-800 hover:border-brand-gold/40',
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border shadow-md',
                      isCurrent
                        ? 'bg-gradient-to-br from-brand-gold to-amber-500 text-slate-950 border-brand-gold'
                        : isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700',
                    )}
                  >
                    V{level.level}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">
                        {level.name}
                      </h3>
                      {isCurrent && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-gold/25 text-brand-gold border border-brand-gold/40">
                          Active Tier
                        </span>
                      )}
                      {isUnlocked && !isCurrent && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Daily Yield: <span className="text-emerald-400 font-bold font-mono">+{formatXRP(level.dailyIncome)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-sm text-brand-gold">
                    {level.price === 0 ? 'FREE' : formatXRP(level.price)}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {level.validityDays} Days Validity
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-text-muted text-[11px]">
                  <span className="flex items-center gap-1">
                    <Zap size={12} className="text-brand-primary" /> Max Daily Tasks: <b className="text-white">{level.maxTasks}</b>
                  </span>
                </div>

                {isCurrent ? (
                  <span className="text-brand-gold font-bold text-xs flex items-center gap-1">
                    <ShieldCheck size={14} /> Active
                  </span>
                ) : isUnlocked ? (
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 size={13} /> Completed
                  </span>
                ) : (
                  <button
                    disabled={upgradingLevel === level.level}
                    onClick={() => handleUpgradeVIP(level.level)}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-brand-gold to-amber-400 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-gold/20 flex items-center gap-1"
                  >
                    <span>{upgradingLevel === level.level ? 'Upgrading...' : `Upgrade (${formatXRP(level.price)})`}</span>
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* VIP Perks Overview Footer */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-brand-gold/10 via-[#0b1526] to-[#00ffff]/10 border border-slate-700/60 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Daily Rebates & Fast Withdrawals</h4>
            <p className="text-[10px] text-text-muted">
              VIP membership includes expedited withdrawal processing and extra commission rebates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
