import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { store } from '../lib/store';
import { NFTItem } from '../types';
import { formatXRP } from '../lib/utils';
import { playSuccessSound, playCoinSound } from '../lib/audio';
import {
  Cpu,
  Zap,
  Activity,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NFTMiningHubProps {
  initialTab?: 'marketplace' | 'myRigs';
}

export default function NFTMiningHub({ initialTab = 'marketplace' }: NFTMiningHubProps) {
  const { user, refreshUser } = useAuth();
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<'marketplace' | 'myRigs'>(initialTab);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Real-time ticking for live unclaimed hash rewards
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const state = store.getState();
  const allNfts = state.nfts || [];

  const availableRigs = allNfts.filter((n) => n.ownerId !== user?.id);
  const myRigs = allNfts.filter((n) => n.ownerId === user?.id);

  const filteredAvailable = availableRigs.filter((rig) => {
    if (selectedTier === 'all') return true;
    if (selectedTier === 'low') return rig.price <= 50;
    if (selectedTier === 'mid') return rig.price > 50 && rig.price <= 300;
    if (selectedTier === 'high') return rig.price > 300;
    return true;
  });

  const calculateUnclaimed = (nft: NFTItem) => {
    let acc = nft.minedAccumulated || 0;
    if (nft.isMining && nft.lastMinedAt) {
      const elapsedSeconds = Math.max(0, (currentTime - nft.lastMinedAt) / 1000);
      const ratePerSec = (nft.dailyMiningRate || 1.0) / 86400;
      acc += elapsedSeconds * ratePerSec;
    }
    return acc;
  };

  const totalMyHashrate = myRigs
    .filter((r) => r.isMining)
    .reduce((acc, curr) => acc + (curr.dailyMiningRate || 0), 0);

  const handleBuy = async (nft: NFTItem) => {
    if (!user) return;
    if (user.balance < nft.price) {
      setActionMsg({
        text: `${t('Insufficient balance')} (${formatXRP(user.balance)} / ${formatXRP(nft.price)})`,
        type: 'error',
      });
      return;
    }

    setPurchasingId(nft.id);
    setActionMsg(null);
    try {
      await store.buyNFT(user.id, nft.id);
      await refreshUser();
      playSuccessSound();
      setActionMsg({
        text: `${t('Purchased successfully')} (${nft.title})`,
        type: 'success',
      });
      setActiveTab('myRigs');
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error purchasing NFT', type: 'error' });
    } finally {
      setPurchasingId(null);
    }
  };

  const handleToggleMining = async (nft: NFTItem) => {
    if (!user) return;
    try {
      await store.toggleNFTMining(user.id, nft.id);
      await refreshUser();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error updating mining state', type: 'error' });
    }
  };

  const handleClaimReward = async (nft: NFTItem) => {
    if (!user) return;
    setClaimingId(nft.id);
    setActionMsg(null);
    try {
      const res = await store.claimNFTMining(user.id, nft.id);
      await refreshUser();
      playCoinSound();
      setActionMsg({
        text: `+${res.reward.toFixed(4)} XRP ${t('Claimed')} (${nft.title})!`,
        type: 'success',
      });
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error claiming rewards', type: 'error' });
    } finally {
      setClaimingId(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Starter':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Silver':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'Gold':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Platinum':
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Diamond':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'Cosmic':
        return 'text-yellow-300 border-yellow-400/40 bg-yellow-400/15 animate-pulse';
      default:
        return 'text-white border-white/20 bg-white/5';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Stat Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/40 via-[#0b1526] to-[#00ffff]/10 border border-[#00ffff]/30 p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00ffff]/20 border border-[#00ffff]/40 flex items-center justify-center text-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <Cpu size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                {t('NFT Rig Mining')}
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-bold border border-brand-gold/30">
                  DEDICATED
                </span>
              </h2>
              <p className="text-[11px] text-text-muted">
                {t('Earn daily XRP by mining directly with your NFT rigs')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-text-muted block">{t('My Balance')}</span>
            <span className="text-sm font-black text-brand-gold">{formatXRP(user?.balance || 0)}</span>
          </div>
        </div>

        {/* Live Rig Summary */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-black/40 p-2 rounded-2xl border border-white/5">
            <span className="text-[10px] text-text-muted block">{t('My NFT Miners')}</span>
            <span className="text-sm font-bold text-white">{myRigs.length} Units</span>
          </div>
          <div className="bg-black/40 p-2 rounded-2xl border border-white/5">
            <span className="text-[10px] text-text-muted block">{t('Active Mining')}</span>
            <span className="text-sm font-bold text-emerald-400">
              {myRigs.filter((r) => r.isMining).length} Running
            </span>
          </div>
          <div className="bg-black/40 p-2 rounded-2xl border border-white/5">
            <span className="text-[10px] text-text-muted block">{t('Daily Yield')}</span>
            <span className="text-sm font-bold text-[#00ffff]">+{totalMyHashrate.toFixed(1)} XRP/d</span>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3 rounded-2xl text-xs text-center border font-bold ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Main Mode Tabs */}
      <div className="flex bg-[#0b1526] p-1 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'marketplace'
              ? 'bg-[#00ffff] text-black shadow-lg shadow-[#00ffff]/20 font-black'
              : 'text-text-muted hover:text-white'
          }`}
        >
          <ShoppingBag size={14} />
          <span>{t('Available NFT Miners')}</span>
        </button>

        <button
          onClick={() => setActiveTab('myRigs')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all relative ${
            activeTab === 'myRigs'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20 font-black'
              : 'text-text-muted hover:text-white'
          }`}
        >
          <Cpu size={14} />
          <span>{t('My NFT Miners')}</span>
          {myRigs.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-black text-white text-[10px] font-black">
              {myRigs.length}
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: NFT MARKETPLACE (BUY RIGS) */}
      {activeTab === 'marketplace' && (
        <div className="space-y-3">
          {/* Price Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedTier === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-text-muted hover:text-white border border-white/10'
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setSelectedTier('low')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedTier === 'low'
                  ? 'bg-emerald-400 text-black'
                  : 'bg-white/5 text-text-muted hover:text-white border border-white/10'
              }`}
            >
              Budget (&le; 50 XRP)
            </button>
            <button
              onClick={() => setSelectedTier('mid')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedTier === 'mid'
                  ? 'bg-cyan-400 text-black'
                  : 'bg-white/5 text-text-muted hover:text-white border border-white/10'
              }`}
            >
              Pro (51 - 300 XRP)
            </button>
            <button
              onClick={() => setSelectedTier('high')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedTier === 'high'
                  ? 'bg-amber-400 text-black'
                  : 'bg-white/5 text-text-muted hover:text-white border border-white/10'
              }`}
            >
              Elite (300+ XRP)
            </button>
          </div>

          {/* Grid of NFTs for sale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredAvailable.map((rig) => (
              <div
                key={rig.id}
                className="bg-[#0b1526] border border-white/10 hover:border-[#00ffff]/40 rounded-3xl p-3.5 flex flex-col justify-between transition-all group shadow-xl"
              >
                <div>
                  {/* NFT Artwork with Rig Banner */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/60 mb-2.5">
                    <img
                      src={rig.imageUrl}
                      alt={rig.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider backdrop-blur-md ${getTierColor(
                          rig.tier
                        )}`}
                      >
                        {rig.tier}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 text-[10px] text-white font-mono font-bold flex items-center gap-1">
                      <Zap size={10} className="text-brand-gold animate-pulse" />
                      {rig.miningPower}
                    </div>

                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        Yield: +{rig.dailyMiningRate} XRP/day
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-white truncate">{rig.title}</h3>
                  <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5 leading-relaxed">
                    {rig.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted block">Price</span>
                    <span className="text-sm font-black text-brand-gold font-mono">
                      {formatXRP(rig.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuy(rig)}
                    disabled={purchasingId === rig.id}
                    className="px-3.5 py-2 bg-[#00ffff] hover:bg-[#00ffff]/90 active:scale-95 text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    {purchasingId === rig.id ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <ShoppingBag size={13} />
                    )}
                    <span>{t('Buy NFT Miner')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: MY OWNED NFT MINERS */}
      {activeTab === 'myRigs' && (
        <div className="space-y-3">
          {myRigs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-[#0b1526] border border-white/10 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted">
                <Cpu size={32} />
              </div>
              <h3 className="text-sm font-bold text-white">{t('No NFT miners owned yet')}</h3>
              <p className="text-xs text-text-muted max-w-xs mx-auto">
                {t('Earn daily XRP by mining directly with your NFT rigs')}
              </p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-5 py-2.5 bg-[#00ffff] text-black font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-all inline-flex items-center gap-1.5"
              >
                <ShoppingBag size={14} />
                <span>{t('Available NFT Miners')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myRigs.map((rig) => {
                const unclaimed = calculateUnclaimed(rig);

                return (
                  <div
                    key={rig.id}
                    className="bg-[#0b1526] border border-white/10 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden"
                  >
                    {rig.isMining && (
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00ffff]/10 rounded-full blur-2xl pointer-events-none" />
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/50 shrink-0 border border-white/10 relative">
                        <img
                          src={rig.imageUrl}
                          alt={rig.title}
                          className="w-full h-full object-cover"
                        />
                        {rig.isMining && (
                          <div className="absolute inset-0 bg-[#00ffff]/20 animate-pulse" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white truncate">{rig.title}</h4>
                          <span
                            className={`text-[9px] font-black px-2 py-0.2 rounded-md border uppercase ${getTierColor(
                              rig.tier
                            )}`}
                          >
                            {rig.tier}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                          <span className="font-mono text-[#00ffff] font-bold flex items-center gap-1">
                            <Zap size={12} /> {rig.miningPower}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            +{rig.dailyMiningRate} XRP/day
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                            rig.isMining
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-white/10 border-white/15 text-text-muted'
                          }`}
                        >
                          {rig.isMining ? t('Active Mining') : t('Rig Idle')}
                        </span>
                      </div>
                    </div>

                    {/* Mining Counter & Progress Visualizer */}
                    <div className="bg-[#050b14] border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-text-muted block">
                          {t('Unclaimed Yield')}
                        </span>
                        <div className="text-base font-black text-brand-gold font-mono">
                          +{unclaimed.toFixed(5)} <span className="text-xs">XRP</span>
                        </div>
                        <span className="text-[9px] text-text-muted">
                          {t('Total Mined')}: {(rig.totalMined || 0).toFixed(4)} XRP
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleMining(rig)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                          title={rig.isMining ? t('Pause Mining') : t('Start NFT Mining')}
                        >
                          {rig.isMining ? <Pause size={14} /> : <Play size={14} className="text-emerald-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleClaimReward(rig)}
                          disabled={claimingId === rig.id || unclaimed < 0.0001}
                          className="px-3.5 py-2 bg-gradient-to-r from-brand-gold to-amber-500 text-black font-black text-xs rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {claimingId === rig.id ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Sparkles size={13} />
                          )}
                          <span>{t('Claim Mined XRP')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
