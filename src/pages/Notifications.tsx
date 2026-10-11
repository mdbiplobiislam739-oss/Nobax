import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { Bell, Info, CheckCircle2, Megaphone, Clock } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const state = store.getState();
  const notices = state.notices || [];
  const myTransactions = (state.transactions || [])
    .filter(t => t.userId === user?.id)
    .slice(0, 10);

  return (
    <div className="space-y-4 pt-2 pb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold text-white">Notifications</h1>
          <p className="text-[11px] text-text-muted">Platform announcements and personal alerts</p>
        </div>
      </div>

      {/* Official Notices */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
          Announcements
        </h3>
        {notices.length === 0 ? (
          <div className="glass-panel p-4 rounded-2xl text-center text-xs text-text-muted">
            No new announcements
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className="p-3.5 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-2xl flex items-start gap-3"
            >
              <div className="p-2 bg-brand-gold/15 text-brand-gold rounded-xl shrink-0 mt-0.5">
                <Megaphone size={16} />
              </div>
              <div className="flex-1 text-xs">
                <p className="text-white leading-relaxed">{n.text}</p>
                <div className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                  <Clock size={10} /> {new Date(n.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Account Alerts */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
          Recent Activity
        </h3>
        {myTransactions.length === 0 ? (
          <div className="glass-panel p-4 rounded-2xl text-center text-xs text-text-muted">
            No recent account activity
          </div>
        ) : (
          myTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-white capitalize">{tx.type}</div>
                <div className="text-[10px] text-text-muted">{tx.description || 'Transaction completed'}</div>
              </div>
              <div className="text-right">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  tx.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {tx.status}
                </span>
                <div className="text-[10px] text-text-muted mt-1">
                  {new Date(tx.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
