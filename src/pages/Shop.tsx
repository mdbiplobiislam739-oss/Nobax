import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { store } from '../lib/store';
import { formatXRP } from '../lib/utils';
import { ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Shop() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const state = store.getState();
  const products = (state.products || []).slice(0, 30);

  const handleBuyProduct = async (item: any) => {
    if (!user) return;
    if (user.balance < item.price) {
      setMsg({
        text: `Insufficient balance (${formatXRP(user.balance)} / ${formatXRP(item.price)}). Need more XRP!`,
        type: 'error',
      });
      return;
    }

    setBuyingId(item.id);
    setMsg(null);
    try {
      const newBal = user.balance - item.price;
      const commission = Number((item.price * 0.05).toFixed(2));

      await store.updateUser(user.id, {
        balance: newBal + commission,
        totalEarnings: (user.totalEarnings || 0) + commission,
      });

      await store.addOrder({
        userId: user.id,
        productId: item.id,
        productName: item.name || item.title,
        price: item.price,
        commission: commission,
        status: 'completed',
      });

      await refreshUser();
      setMsg({
        text: `Success! Purchased "${item.name || item.title}" and earned ${formatXRP(commission)} cashback commission reward!`,
        type: 'success',
      });
    } catch (err: any) {
      setMsg({ text: err.message || 'Purchase failed', type: 'error' });
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-gold" />
            <span>Daily Tasks Mall</span>
          </h1>
          <p className="text-xs text-text-muted">Complete shopping orders & earn instant +5% cashback commissions</p>
        </div>
        <div className="text-right text-xs">
          <span className="text-text-muted">My Balance: </span>
          <span className="font-bold text-brand-gold font-mono">{formatXRP(user?.balance || 0)}</span>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-2xl text-xs text-center border font-bold flex items-center justify-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-2xl border border-white/10 bg-[var(--color-bg-card)]/90 flex flex-col justify-between overflow-hidden group hover:border-brand-gold/40 transition-colors shadow-md"
          >
            <div>
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/40 mb-2 relative">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=300';
                  }}
                />
                <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-bold text-brand-gold border border-brand-gold/30">
                  +5% Cashback
                </div>
              </div>
              <h3 className="font-bold text-xs text-white truncate">{item.name}</h3>
              <p className="text-[10px] text-text-muted truncate mt-0.5">{item.hash}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-text-muted">Price</div>
                <div className="font-bold text-xs text-brand-gold font-mono">{formatXRP(item.price)}</div>
              </div>

              <button
                onClick={() => handleBuyProduct(item)}
                disabled={buyingId === item.id}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 rounded-xl font-black text-[10px] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
              >
                {buyingId === item.id ? 'Processing...' : 'Buy Task'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
