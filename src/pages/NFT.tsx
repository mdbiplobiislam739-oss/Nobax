import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { store, VIP_LEVELS } from '../lib/store';
import { formatXRP, cn } from '../lib/utils';
import { NFTItem } from '../types';
import { playSuccessSound } from '../lib/audio';
import {
  Sparkles,
  Zap,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Crown,
  Flame,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NFT() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'marketplace' | 'myCollection' | 'vipTiers'>('marketplace');
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
  const myNfts = allNfts.filter((n) => n.ownerId === user?.id);

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
        text: `Insufficient balance (${formatXRP(user.balance)} / ${formatXRP(nft.price)}). Need more XRP!`,
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
        text: `Successfully acquired ${nft.title}! Added to your mining rigs.`,
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
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-20">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c162d] via-[#091124] to-[#040915] border border-[#00ffff]/30 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#00ffff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]/30 flex items-center gap-1 w-fit">
              <Sparkles size={11} /> EXCLUSIVE NFT MARKETPLACE
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Collect NFTs • Boost Hash • Earn Daily</span>
            </h1>
            <p className="text-xs text-text-muted max-w-md leading-relaxed">
              Every NFT provides dedicated mining power. The rarer your artwork, the higher your daily crypto returns!
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 shrink-0 text-right">
            <span className="text-[10px] text-text-muted block">My Balance</span>
            <span className="text-base font-black text-brand-gold font-mono">
              {formatXRP(user?.balance || 0)}
            </span>
            {(user?.balance || 0) < 15 && (
              <button
                onClick={async () => {
                  if (!user) return;
                  await store.claimDemoBalance(user.id, 50);
                  await refreshUser();
                  setMsg({ text: '+50 XRP Added to Balance for Demo Testing!', type: 'success' });
                }}
                className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1 justify-center"
              >
                <Sparkles size={10} />
                <span>+50 XRP Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-[#0b1526]/90 p-1.5 rounded-2xl border border-slate-700/60 gap-1.5 shadow-lg">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={cn(
            'flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border',
            activeTab === 'marketplace'
              ? 'bg-gradient-to-r from-[#00ffff] to-cyan-400 text-slate-950 font-black shadow-lg shadow-[#00ffff]/20 border-[#00ffff]'
              : 'bg-slate-800/60 border-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-700/60',
          )}
        >
          <ShoppingBag size={14} />
          <span>Marketplace</span>
          <span className={cn(
            "px-1.5 py-0.2 rounded-full text-[9px] font-black",
            activeTab === 'marketplace' ? "bg-black/80 text-[#00ffff]" : "bg-slate-700 text-white"
          )}>
            {allNfts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('myCollection')}
          className={cn(
            'flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border',
            activeTab === 'myCollection'
              ? 'bg-gradient-to-r from-brand-primary to-orange-400 text-white font-black shadow-lg shadow-brand-primary/25 border-brand-primary'
              : 'bg-slate-800/60 border-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-700/60',
          )}
        >
          <Cpu size={14} />
          <span>My Rigs</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-white text-[9px] font-black">
            {myNfts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vipTiers')}
          className={cn(
            'flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border',
            activeTab === 'vipTiers'
              ? 'bg-gradient-to-r from-brand-gold to-amber-300 text-slate-950 font-black shadow-lg shadow-brand-gold/25 border-brand-gold'
              : 'bg-slate-800/60 border-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-700/60',
          )}
        >
          <Crown size={14} />
          <span>VIP Ranks</span>
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
              Start Mining &rarr;
            </button>
          )}
        </div>
      )}

      {/* TAB 1: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {/* Filters & Search */}
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
                      : 'bg-slate-800/60 text-text-muted hover:text-white border border-slate-700/60',
                  )}
                >
                  {rarity === 'all' ? 'All' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
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
                placeholder="Search NFT by name, power, or rarity..."
                className="w-full bg-[#0b1526] border border-slate-700/60 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted outline-none focus:border-[#00ffff]/50 transition-colors"
              />
            </div>
          </div>

          {/* Grid of NFTs */}
          <div className="grid grid-cols-2 gap-3">
            {filteredNfts.map((nft) => {
              const isOwned = nft.ownerId === user?.id;

              return (
                <div
                  key={nft.id}
                  className={cn(
                    'group relative rounded-2xl p-3 border transition-all duration-300 flex flex-col justify-between overflow-hidden',
                    isOwned
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-gradient-to-b from-[#0f172a] to-[#090d16] border-slate-800 hover:border-[#00ffff]/40 hover:shadow-xl hover:shadow-[#00ffff]/5',
                  )}
                >
                  <div>
                    {/* Artwork Container */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 mb-2.5">
                      <img
                        src={nft.imageUrl}
                        alt={nft.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?auto=format&fit=crop&w=600&q=80';
                        }}
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

                    <div className="mt-1 flex items-center justify-between text-[11px] text-text-muted">
                      <span>Daily Reward:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        +{nft.dailyMiningRate} XRP
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-1">
                    <div>
                      <span className="text-[9px] text-text-muted block">Price</span>
                      <span className="text-xs font-black text-brand-gold font-mono">
                        {formatXRP(nft.price)}
                      </span>
                    </div>

                    {isOwned ? (
                      <button
                        onClick={() => navigate('/mining')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1 hover:bg-emerald-500/30 transition-all"
                      >
                        <Cpu size={11} />
                        <span>In Mining</span>
                      </button>
                    ) : (
                      <button
                        disabled={purchasingId === nft.id}
                        onClick={() => handleBuyNFT(nft)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1',
                          purchasingId === nft.id
                            ? 'bg-white/20 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#00ffff] to-cyan-400 text-black hover:opacity-90 active:scale-95 shadow-md shadow-[#00ffff]/20',
                        )}
                      >
                        {purchasingId === nft.id ? (
                          'Buying...'
                        ) : (
                          <>
                            <ShoppingBag size={11} />
                            <span>Buy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY COLLECTION */}
      {activeTab === 'myCollection' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-3xl border border-brand-primary/30 bg-gradient-to-r from-brand-primary/10 via-[var(--color-bg-card)] to-brand-gold/10 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu size={16} className="text-brand-primary" />
                <span>My Active NFT Miners</span>
              </h2>
              <p className="text-[11px] text-text-muted">
                {myNfts.length} Rigs generating passive hash power
              </p>
            </div>
            <button
              onClick={() => navigate('/mining')}
              className="px-3 py-1.5 bg-gradient-to-r from-brand-primary to-brand-gold text-black rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <span>Mining Console</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {myNfts.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl text-center space-y-3 border border-white/10">
              <Cpu size={36} className="text-text-muted mx-auto" />
              <h3 className="font-bold text-sm text-white">No NFTs in your collection yet</h3>
              <p className="text-xs text-text-muted max-w-xs mx-auto">
                Explore the marketplace and acquire your first NFT mining rig to start earning daily XRP.
              </p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-5 py-2.5 bg-[#00ffff] text-black font-black text-xs rounded-xl shadow-lg"
              >
                Browse NFT Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {myNfts.map((nft) => (
                <div
                  key={nft.id}
                  className="rounded-2xl p-3 border border-emerald-500/30 bg-emerald-950/15 flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 mb-2">
                    <img
                      src={nft.imageUrl}
                      alt={nft.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-black">
                      OWNED
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white truncate">{nft.title}</h4>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      +{nft.dailyMiningRate} XRP / day
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/mining')}
                    className="mt-2 w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] rounded-xl border border-emerald-500/40 flex items-center justify-center gap-1"
                  >
                    <Zap size={11} /> Manage Rig &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VIP TIERS */}
      {activeTab === 'vipTiers' && (
        <div className="space-y-3">
          {VIP_LEVELS.map((vip) => {
            const isCurrent = (user?.vipLevel || 0) === vip.level;
            return (
              <div
                key={vip.level}
                className={cn(
                  'glass-panel p-4 rounded-2xl border transition-all flex items-center justify-between',
                  isCurrent
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-white/10 hover:border-white/20',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center text-brand-gold border border-brand-gold/30">
                    <Crown size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      <span>{vip.name}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-gold text-black text-[9px] font-black uppercase">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Daily tasks: <span className="text-white">{vip.maxTasks}</span> • Daily rate: <span className="text-brand-gold font-mono">{formatXRP(vip.dailyIncome)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-xs text-brand-gold">
                    {vip.price === 0 ? 'Free' : formatXRP(vip.price)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
