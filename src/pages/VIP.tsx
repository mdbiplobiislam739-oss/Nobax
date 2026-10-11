import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { store, VIP_LEVELS } from '../lib/store';
import { formatXRP, cn } from '../lib/utils';
import { NFTItem } from '../types';
import { playSuccessSound } from '../lib/audio';
import {
  Crown,
  Zap,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VIP() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'nfts' | 'vipLevels'>('nfts');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((prev) => prev + 1);
    window.addEventListener('store_updated', handleUpdate);
    return () => window.removeEventListener('store_updated', handleUpdate);
  }, []);

  const state = store.getState();
  const allNfts: NFTItem[] = (state.nfts || []).filter((n) => Boolean(n));

  const currentLevel = user?.vipLevel || 0;

  // Filter photo NFTs with safe null checks
  const filteredNfts = allNfts.filter((nft) => {
    const tier = (nft?.tier || 'Common').toLowerCase();
    // Rarity filter
    if (selectedRarity !== 'all' && tier !== selectedRarity.toLowerCase()) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const title = (nft?.title || '').toLowerCase();
      const power = (nft?.miningPower || '').toLowerCase();
      return title.includes(q) || power.includes(q) || tier.includes(q);
    }
    return true;
  });

  const handleBuyNFT = async (nft: NFTItem) => {
    if (!user) return;
    if (nft.ownerId === user.id) {
      navigate('/mining');
      return;
    }

    if (user.balance < nft.price) {
      setMsg({
        text: `${t('Insufficient balance')} (${formatXRP(user.balance)} / ${formatXRP(nft.price)})`,
        type: 'error',
      });
      return;
    }

    setPurchasingId(nft.id);
    setMsg(null);
    try {
      await store.buyNFT(user.id, nft.id);
      await refreshUser();
      playSuccessSound();
      setMsg({
        text: `${t('Purchased successfully')} (${nft.title})!`,
        type: 'success',
      });
    } catch (err: any) {
      setMsg({ text: err.message || 'Error purchasing NFT', type: 'error' });
    } finally {
      setPurchasingId(null);
    }
  };

  const getRarityBadgeStyle = (tier?: string) => {
    switch ((tier || 'Common').toLowerCase()) {
      case 'common':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'rare':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'epic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'legendary':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(255,191,0,0.2)]';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-20">
      {/* Top Banner Matching Photo Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c162d] via-[#091124] to-[#040915] border border-[#00ffff]/30 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#00ffff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]/30">
              EXCLUSIVE NFT MARKET
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{t('Buy NFT. Activate Mining. Earn Daily!')}</span>
            </h1>
            <p className="text-xs text-text-muted max-w-md leading-relaxed">
              {t(
                'Each NFT gives you a mining power. The higher the rarity, the more you earn. Collect, upgrade and grow your income!',
              )}
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 shrink-0 text-right">
            <span className="text-[10px] text-text-muted block">{t('My Balance')}</span>
            <span className="text-base font-black text-brand-gold font-mono">
              {formatXRP(user?.balance || 0)}
            </span>
            {(user?.balance || 0) < 15 && (
              <button
                onClick={async () => {
                  if (!user) return;
                  await store.claimDemoBalance(user.id, 50);
                  await refreshUser();
                  setMsg({ text: '+50 XRP Added to Test Balance!', type: 'success' });
                }}
                className="mt-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1 justify-center"
              >
                <Sparkles size={10} />
                <span>+50 XRP Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs: Exclusive NFTs vs Membership Tiers */}
      <div className="flex bg-[#0b1526] p-1 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('nfts')}
          className={cn(
            'flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all',
            activeTab === 'nfts'
              ? 'bg-[#00ffff] text-black font-black shadow-lg shadow-[#00ffff]/20'
              : 'text-text-muted hover:text-white',
          )}
        >
          <Cpu size={15} />
          <span>{t('NFT Market')}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black text-[#00ffff] text-[9px] font-black">
            {allNfts.length} NFTs
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vipLevels')}
          className={cn(
            'flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all',
            activeTab === 'vipLevels'
              ? 'bg-brand-gold text-black font-black shadow-lg shadow-brand-gold/20'
              : 'text-text-muted hover:text-white',
          )}
        >
          <Crown size={15} />
          <span>{t('VIP Membership')}</span>
        </button>
      </div>

      {msg && (
        <div
          className={cn(
            'p-3 rounded-2xl text-xs text-center border font-bold flex items-center justify-center gap-2',
            msg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          )}
        >
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
          {msg.type === 'success' && (
            <button
              onClick={() => navigate('/mining')}
              className="ml-2 px-2.5 py-1 bg-[#00ffff] text-black rounded-lg text-[10px] font-black uppercase hover:opacity-90"
            >
              Go to Mining &rarr;
            </button>
          )}
        </div>
      )}

      {/* TAB 1: EXACT PHOTO NFTs MARKETPLACE */}
      {activeTab === 'nfts' && (
        <div className="space-y-4">
          {/* Filters & Search Bar exactly like photo */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {['all', 'common', 'rare', 'epic', 'legendary'].map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all uppercase text-[11px]',
                    selectedRarity === rarity
                      ? 'bg-white text-black shadow-md'
                      : 'bg-white/5 text-text-muted hover:text-white border border-white/10',
                  )}
                >
                  {rarity === 'all' ? t('All') : t(rarity.charAt(0).toUpperCase() + rarity.slice(1))}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search NFT...')}
                className="w-full bg-[#0b1526] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted outline-none focus:border-[#00ffff]/50 transition-colors"
              />
            </div>
          </div>

          {/* Grid of the 10 NFTs from the photo */}
          <div className="grid grid-cols-2 gap-3">
            {filteredNfts.map((nft) => {
              const isOwned = nft.ownerId === user?.id;

              return (
                <div
                  key={nft.id}
                  className="bg-[#0b1526] border border-white/10 hover:border-[#00ffff]/40 rounded-3xl p-3 flex flex-col justify-between transition-all group shadow-xl relative overflow-hidden"
                >
                  <div>
                    {/* Artwork Container */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 mb-2.5">
                      <img
                        src={nft.imageUrl}
                        alt={nft.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Rarity Tag */}
                      <div className="absolute top-2 left-2">
                        <span
                          className={cn(
                            'text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider backdrop-blur-md',
                            getRarityBadgeStyle(nft.tier),
                          )}
                        >
                          {nft.tier}
                        </span>
                      </div>

                      {/* Mining Power */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                          <Zap size={10} className="text-brand-gold animate-pulse" />
                          {nft.miningPower}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-xs text-white truncate" title={nft.title}>
                      {nft.title}
                    </h3>

                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-text-muted">Mining Power:</span>
                      <span className="text-[#00ffff] font-mono font-bold">{nft.miningPower || '+40 GH/s'}</span>
                    </div>

                    <div className="mt-0.5 flex items-center justify-between text-[10px]">
                      <span className="text-text-muted">Daily Return:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        +{nft.dailyMiningRate || 0.45} XRP/day
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center justify-between text-[10px]">
                      <span className="text-text-muted">Price:</span>
                      <span className="text-brand-gold font-mono font-black">
                        {formatXRP(nft.price)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10">
                    {isOwned ? (
                      <button
                        onClick={() => navigate('/mining')}
                        className="w-full py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        <CheckCircle2 size={13} />
                        <span>Active Miner</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyNFT(nft)}
                        disabled={purchasingId === nft.id}
                        className="w-full py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {purchasingId === nft.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ShoppingBag size={13} />
                        )}
                        <span>{t('Buy Now')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Motivational Banner from bottom of photo */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-900/40 via-[#0b1526] to-[#00ffff]/10 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {t('Own a Rare NFT and Boost Your Mining Power!')}
                </h4>
                <p className="text-[10px] text-text-muted">
                  Daily rewards earn USDT/XRP automatically every 24 hours.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/mining')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold shrink-0"
            >
              My Rigs &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: VIP MEMBERSHIP LEVELS */}
      {activeTab === 'vipLevels' && (
        <div className="space-y-3">
          {VIP_LEVELS.map((level) => {
            const isCurrent = currentLevel === level.level;
            const isUnlocked = currentLevel >= level.level;

            return (
              <div
                key={level.level}
                className={cn(
                  'p-4 rounded-2xl transition-all border relative overflow-hidden',
                  isCurrent
                    ? 'bg-brand-gold/10 border-brand-gold/60 shadow-[0_0_20px_rgba(255,200,0,0.15)]'
                    : isUnlocked
                    ? 'bg-[var(--color-bg-card)]/50 border-white/10 opacity-70'
                    : 'bg-[var(--color-bg-card)] border-[var(--color-border-card)] hover:border-brand-primary/40',
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs',
                        isCurrent ? 'bg-brand-gold text-black' : 'bg-white/10 text-white',
                      )}
                    >
                      V{level.level}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        {level.name}
                        {isCurrent && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold">
                            Active
                          </span>
                        )}
                      </h3>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        Daily: <span className="text-white font-semibold">{formatXRP(level.dailyIncome)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-brand-gold">
                      {level.price === 0 ? 'FREE' : formatXRP(level.price)}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {level.validityDays} Days Validity
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-text-muted flex items-center gap-1">
                    <Zap size={12} className="text-brand-primary" /> Daily Tasks: {level.maxTasks}
                  </span>

                  {isCurrent ? (
                    <span className="text-brand-gold font-bold flex items-center gap-1">
                      <ShieldCheck size={14} /> Active Tier
                    </span>
                  ) : (
                    <span className="text-text-muted text-[10px]">
                      Tier Upgrade
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
