import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { formatXRP } from '../lib/utils';
import { Users, Copy, Check, Share2, Award, ChevronRight, UserPlus } from 'lucide-react';

export default function Team() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const state = store.getState();

  const refCode = user?.username || '';
  const refLink = `${window.location.origin}/register?ref=${refCode}`;

  const allUsers = state.users || [];
  // Direct level 1 referrals
  const level1Users = allUsers.filter(u => u.referrerId?.toLowerCase() === user?.username.toLowerCase());
  
  // Direct level 2 referrals (users referred by level 1)
  const l1Usernames = level1Users.map(u => u.username.toLowerCase());
  const level2Users = allUsers.filter(u => u.referrerId && l1Usernames.includes(u.referrerId.toLowerCase()));

  // Direct level 3 referrals (users referred by level 2)
  const l2Usernames = level2Users.map(u => u.username.toLowerCase());
  const level3Users = allUsers.filter(u => u.referrerId && l2Usernames.includes(u.referrerId.toLowerCase()));

  const totalMembers = level1Users.length + level2Users.length + level3Users.length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pt-2 pb-6">
      {/* Referral Link Card */}
      <div className="glass-panel p-5 rounded-3xl bg-gradient-to-br from-brand-primary/15 via-[var(--color-bg-card)] to-brand-gold/15 border border-brand-primary/30 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/30">
            <Share2 size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Invite & Earn Rewards</h1>
            <p className="text-[11px] text-text-muted">Earn up to 17% 3-Tier Commission</p>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <div>
            <div className="text-[10px] text-text-muted font-bold uppercase mb-1">Your Invitation Code</div>
            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs">
              <span className="font-mono font-bold text-brand-gold tracking-wider">{refCode || 'N/A'}</span>
              <button
                onClick={() => copyToClipboard(refCode)}
                className="text-text-muted hover:text-white flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted font-bold uppercase mb-1">Invitation Link</div>
            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs">
              <span className="font-mono text-text-muted truncate mr-2 text-[10px]">{refLink}</span>
              <button
                onClick={() => copyToClipboard(refLink)}
                className="px-2.5 py-1 bg-brand-primary text-black rounded-lg font-bold text-[10px] shrink-0 hover:opacity-90 active:scale-95"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-panel p-3 rounded-2xl border border-[var(--color-border-card)] text-center">
          <div className="text-[10px] text-text-muted font-bold">Level 1 (10%)</div>
          <div className="text-lg font-bold text-brand-primary mt-1">{level1Users.length}</div>
          <div className="text-[9px] text-text-muted mt-0.5">Direct</div>
        </div>
        <div className="glass-panel p-3 rounded-2xl border border-[var(--color-border-card)] text-center">
          <div className="text-[10px] text-text-muted font-bold">Level 2 (5%)</div>
          <div className="text-lg font-bold text-brand-gold mt-1">{level2Users.length}</div>
          <div className="text-[9px] text-text-muted mt-0.5">Sub-team</div>
        </div>
        <div className="glass-panel p-3 rounded-2xl border border-[var(--color-border-card)] text-center">
          <div className="text-[10px] text-text-muted font-bold">Level 3 (2%)</div>
          <div className="text-lg font-bold text-[#00FFFF] mt-1">{level3Users.length}</div>
          <div className="text-[9px] text-text-muted mt-0.5">Tier 3</div>
        </div>
      </div>

      {/* Commission Rules */}
      <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)]">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
          <Award size={14} className="text-brand-gold" /> Commission Structure
        </h3>
        <p className="text-[11px] text-text-muted leading-relaxed whitespace-pre-line">
          {state.referralBonusText || `Invite friends to top up and earn instant rebate commissions:
• Level 1: 10% on deposits & task rewards
• Level 2: 5% sub-referral commission
• Level 3: 2% indirect network commission`}
        </p>
      </div>

      {/* Direct Referrals List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5 px-1">
          <Users size={14} className="text-brand-primary" /> Direct Members ({level1Users.length})
        </h3>
        {level1Users.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border-card)] text-center text-text-muted text-xs">
            <UserPlus size={24} className="mx-auto mb-2 opacity-40 text-brand-primary" />
            No invited members yet. Share your link to start building your team!
          </div>
        ) : (
          <div className="space-y-2">
            {level1Users.map((u) => (
              <div
                key={u.id}
                className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{u.username}</div>
                  <div className="text-[10px] text-text-muted">
                    Joined: {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary font-bold">
                    VIP {u.vipLevel || 0}
                  </div>
                  <div className="text-[10px] text-text-muted mt-1">
                    Balance: {formatXRP(u.balance || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
