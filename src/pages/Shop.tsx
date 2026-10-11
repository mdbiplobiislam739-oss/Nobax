import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { store } from '../lib/store';
import { formatXRP } from '../lib/utils';
import { ShoppingBag, Cpu, Check, ArrowRight } from 'lucide-react';
import NFTMiningHub from '../components/NFTMiningHub';

export default function Shop() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'products' | 'nfts'>('products');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const state = store.getState();
  const products = (state.products || []).slice(0, 30);

  const handleBuyProduct = async (item: any) => {
    if (!user) return;
    if (user.balance < item.price) {
      setMsg({
        text: `${t('Insufficient balance')}. (${formatXRP(user.balance)} / ${formatXRP(item.price)})`,
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
        text: `Success! Purchased "${item.name || item.title}" and earned ${formatXRP(commission)} commission reward!`,
        type: 'success',
      });
    } catch (err: any) {
      setMsg({ text: err.message || 'Purchase failed', type: 'error' });
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-primary" /> {t('Mall & NFT Market')}
          </h1>
          <p className="text-xs text-text-muted">Earn instant cashback commissions or mine with NFT rigs</p>
        </div>
        <div className="text-right text-xs">
          <span className="text-text-muted">{t('My Balance')}: </span>
          <span className="font-bold text-brand-gold">{formatXRP(user?.balance || 0)}</span>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-2xl text-xs text-center border ${
            msg.type === 'success'
              ? 'bg-green-500/15 border-green-500/30 text-green-400'
              : 'bg-red-500/15 border-red-500/30 text-red-400'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-[var(--color-bg-card)] p-1 rounded-2xl border border-[var(--color-border-card)]">
        <button
          onClick={() => setTab('products')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            tab === 'products' ? 'bg-brand-primary text-black font-black shadow-md' : 'text-text-muted hover:text-white'
          }`}
        >
          {t('Daily Tasks Mall')}
        </button>
        <button
          onClick={() => setTab('nfts')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            tab === 'nfts' ? 'bg-[#00ffff] text-black font-black shadow-md' : 'text-text-muted hover:text-white'
          }`}
        >
          <Cpu size={14} />
          <span>{t('NFT Marketplace')}</span>
        </button>
      </div>

      {/* Content */}
      {tab === 'nfts' ? (
        <NFTMiningHub initialTab="marketplace" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-3 rounded-2xl border border-[var(--color-border-card)] flex flex-col justify-between overflow-hidden group hover:border-brand-primary/40 transition-colors"
            >
              <div>
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/40 mb-2 relative">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-brand-gold border border-brand-gold/30">
                    +5% Cashback
                  </div>
                </div>
                <h3 className="font-bold text-xs text-white truncate">{item.name}</h3>
                <p className="text-[10px] text-text-muted truncate mt-0.5">{item.hash}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-text-muted">Price</div>
                  <div className="font-bold text-xs text-brand-gold">{formatXRP(item.price)}</div>
                </div>

                <button
                  onClick={() => handleBuyProduct(item)}
                  disabled={buyingId === item.id}
                  className="px-2.5 py-1.5 bg-brand-primary text-black rounded-xl font-bold text-[10px] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {buyingId === item.id ? '...' : 'Buy Task'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
