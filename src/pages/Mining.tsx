import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/TranslationContext";
import { store } from "../lib/store";
import { formatXRP, cn } from "../lib/utils";
import { NFTItem, Transaction } from "../types";
import { playCoinSound, playSuccessSound } from "../lib/audio";
import {
  Cpu,
  Zap,
  ShoppingBag,
  History as HistoryIcon,
  X,
  Play,
  Pause,
  Sparkles,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Crown,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Mining() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isClaimingAll, setIsClaimingAll] = useState(false);

  // High-frequency clock to tick unclaimed mining yield in real time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const state = store.getState();
  const allNfts: NFTItem[] = state.nfts || [];

  // ONLY THE NFTs THE USER HAS PURCHASED!
  const myRigs = allNfts.filter((n) => n.ownerId === user?.id);

  const calculateUnclaimed = (nft: NFTItem) => {
    if (!nft) return 0;
    let acc = nft.minedAccumulated || 0;
    if (nft.isMining && nft.lastMinedAt) {
      const elapsedSeconds = Math.max(0, (currentTime - nft.lastMinedAt) / 1000);
      const ratePerSec = (nft.dailyMiningRate || 1.0) / 86400;
      acc += elapsedSeconds * ratePerSec;
    }
    return Math.max(0, isNaN(acc) ? 0 : acc);
  };

  const totalUnclaimedAll = myRigs.reduce((sum, rig) => sum + calculateUnclaimed(rig), 0);
  const activeRigs = myRigs.filter((r) => r?.isMining);
  const activeRigsCount = activeRigs.length;

  const totalDailyYield = activeRigs.reduce((sum, r) => sum + (r?.dailyMiningRate || 0), 0);

  // Parse mining power safely (e.g. "+250 GH/s" -> 250)
  const totalMiningPowerGh = activeRigs.reduce((sum, r) => {
    const powerStr = r?.miningPower || '';
    const match = powerStr.match(/\d+(\.\d+)?/);
    return sum + (match ? parseFloat(match[0]) : 40);
  }, 0);

  // Percent power representation
  const powerPercentage = myRigs.length > 0 ? Math.min(100, Math.round((activeRigsCount / myRigs.length) * 100)) : 0;

  const handleToggleMining = async (nft: NFTItem) => {
    if (!user) return;
    try {
      await store.toggleNFTMining(user.id, nft.id);
      await refreshUser();
    } catch (err: any) {
      setActionMsg({ text: err.message || "Error toggling mining", type: "error" });
    }
  };

  const handleClaim = async (nft: NFTItem) => {
    if (!user) return;
    setClaimingId(nft.id);
    setActionMsg(null);
    try {
      const res = await store.claimNFTMining(user.id, nft.id);
      await refreshUser();
      playCoinSound();
      setActionMsg({
        text: `+${res.reward.toFixed(4)} XRP ${t("Claimed!")} (${nft.title})`,
        type: "success",
      });
    } catch (err: any) {
      setActionMsg({ text: err.message || "Error claiming reward", type: "error" });
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimAll = async () => {
    if (!user || totalUnclaimedAll <= 0.0001) return;
    setIsClaimingAll(true);
    setActionMsg(null);
    try {
      const res = await store.claimAllNFTMining(user.id);
      await refreshUser();
      playCoinSound();
      setActionMsg({
        text: `+${res.totalReward.toFixed(4)} XRP ${t("Claimed!")} (${myRigs.length} ${t("Your NFTs")})`,
        type: "success",
      });
    } catch (err: any) {
      setActionMsg({ text: err.message || "Error claiming all rewards", type: "error" });
    } finally {
      setIsClaimingAll(false);
    }
  };

  const handleToggleAll = async (start: boolean) => {
    if (!user || myRigs.length === 0) return;
    try {
      await store.toggleAllNFTMining(user.id, start);
      await refreshUser();
      playSuccessSound();
    } catch (err: any) {
      setActionMsg({ text: err.message || "Error updating rigs", type: "error" });
    }
  };

  const getRarityBadgeStyle = (tier?: string) => {
    switch ((tier || "Common").toLowerCase()) {
      case "common":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "rare":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
      case "epic":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      case "legendary":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(255,191,0,0.2)]";
      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  // Recent activity transactions related to NFTs and mining
  const recentActivities = (store.getState().transactions || [])
    .filter(
      (t) => t.userId === user?.id && (t.type === "nft_mining" || t.type === "buy_nft" || t.type === "mining"),
    )
    .slice(0, 5);

  return (
    <div className="space-y-4 pt-1 pb-20 relative">
      {/* Top Main Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Cpu className="text-[#00ffff] animate-pulse" size={22} />
            <span>{t("NFT Mining")}</span>
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {t("Buy NFT. Activate Mining. Earn Daily!")}
          </p>
        </div>
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center border border-white/10 text-white transition-all shadow-md"
          title={t("Recent Activity")}
        >
          <HistoryIcon size={18} />
        </button>
      </div>

      {/* Hero Banner matching the uploaded photo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d162f] via-[#091122] to-[#040816] border border-[#00ffff]/30 p-4 sm:p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#00ffff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]/30">
                ACTIVE MINING STATION
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {t("NFT Mining")}
            </h2>
            <p className="text-xs text-text-muted max-w-sm leading-relaxed">
              {t(
                "Each NFT gives you a mining power. The higher the rarity, the more you earn. Collect, upgrade and grow your income!",
              )}
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate("/nft")}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition-all inline-flex items-center gap-1.5"
              >
                <span>{t("Explore NFTs")}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 shrink-0 flex flex-col gap-2 min-w-[150px]">
            <div>
              <span className="text-[10px] uppercase font-bold text-text-muted block">
                {t("Total Mining Power")}
              </span>
              <span className="text-sm font-black text-[#00ffff] font-mono">
                {totalMiningPowerGh > 0 ? `+${totalMiningPowerGh.toFixed(2)} GH/s` : "0.00 GH/s"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-text-muted block">
                {t("Daily Earning (Est.)")}
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                +{totalDailyYield.toFixed(4)} USDT/XRP
              </span>
            </div>

            {myRigs.length > 0 && (
              <button
                onClick={() => handleToggleAll(activeRigsCount === 0)}
                className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1"
              >
                {activeRigsCount === 0 ? <Play size={12} className="text-emerald-400" /> : <Pause size={12} />}
                <span>{activeRigsCount === 0 ? t("Start Mining") : t("Pause Mining")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {actionMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-2xl text-xs text-center border font-bold flex items-center justify-center gap-2",
            actionMsg.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/15 border-rose-500/30 text-rose-400",
          )}
        >
          {actionMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionMsg.text}</span>
        </motion.div>
      )}

      {/* CASE 1: USER HAS NOT PURCHASED ANY NFT YET */}
      {myRigs.length === 0 ? (
        <div className="text-center py-12 px-5 rounded-3xl bg-[#0b1526] border border-white/10 space-y-4 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#00ffff]/10 border border-[#00ffff]/20 flex items-center justify-center text-[#00ffff]">
            <Cpu size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {t("No NFT miners owned yet")}
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
              মাইনিং পেজে শুধুমাত্র আপনার কেনা এনএফটি মাইনিং করবে। মাইনিং শুরু করতে ভিআইপি পেজ থেকে আপনার পছন্দের এনএফটি রিগ কিনুন!
            </p>
          </div>
          <button
            onClick={() => navigate("/vip")}
            className="px-6 py-3 bg-gradient-to-r from-[#00ffff] to-cyan-400 text-black font-black text-xs rounded-2xl shadow-lg shadow-[#00ffff]/20 hover:opacity-95 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <ShoppingBag size={15} />
            <span>{t("Explore NFTs")} (VIP Page)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        /* CASE 2: USER HAS PURCHASED NFTs -> DISPLAY ONLY OWNED NFTs! */
        <div className="space-y-4">
          {/* Your Mining Overview Widget (From photo right sidebar) */}
          <div className="bg-[#0b1526] border border-white/10 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Zap size={16} className="text-[#00ffff]" />
                <span>{t("Your Mining Overview")}</span>
              </h3>
              <span className="text-[10px] text-text-muted">
                {activeRigsCount} {t("Active Mining")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Circular Dial Visual */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#00ffff]"
                      strokeDasharray={`${powerPercentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-white font-mono">
                    {powerPercentage}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">{t("Total Power")}</span>
                  <span className="text-xs font-bold text-white">
                    {activeRigsCount} / {myRigs.length} Units
                  </span>
                </div>
              </div>

              {/* Unclaimed Rewards & Claim Button */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-3 space-y-1">
                <span className="text-[10px] text-text-muted block">{t("Unclaimed Yield")}</span>
                <div className="text-base font-black text-brand-gold font-mono">
                  +{totalUnclaimedAll.toFixed(5)} <span className="text-[10px]">XRP</span>
                </div>
                <button
                  type="button"
                  onClick={handleClaimAll}
                  disabled={isClaimingAll || totalUnclaimedAll <= 0.0001}
                  className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 active:scale-95 text-white font-black text-[11px] rounded-xl shadow-md transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  {isClaimingAll ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>{t("Claim Reward")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* YOUR OWNED NFTs GALLERY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Layers size={16} className="text-[#00ffff]" />
                <span>{t("Your NFTs")}</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/10 text-white font-mono font-bold">
                  {myRigs.length}
                </span>
              </h3>
              <button
                onClick={() => navigate("/nft")}
                className="text-[11px] font-bold text-[#00ffff] hover:underline flex items-center gap-0.5"
              >
                <span>+ Buy More</span>
              </button>
            </div>

            <div className="space-y-3">
              {myRigs.map((rig) => {
                const unclaimed = calculateUnclaimed(rig);

                return (
                  <div
                    key={rig.id}
                    className="bg-[#0b1526] border border-white/10 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden group hover:border-[#00ffff]/40 transition-all"
                  >
                    {rig.isMining && (
                      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#00ffff]/10 rounded-full blur-2xl pointer-events-none" />
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/60 shrink-0 border border-white/15 relative">
                        <img
                          src={rig.imageUrl}
                          alt={rig.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {rig.isMining && (
                          <div className="absolute inset-0 bg-[#00ffff]/20 animate-pulse pointer-events-none" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white truncate">{rig.title}</h4>
                          <span
                            className={cn(
                              "text-[9px] font-black px-2 py-0.5 rounded-md border uppercase",
                              getRarityBadgeStyle(rig.tier),
                            )}
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

                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block",
                            rig.isMining
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                              : "bg-white/10 border-white/15 text-text-muted",
                          )}
                        >
                          {rig.isMining ? t("Active Mining") : t("Rig Idle")}
                        </span>
                      </div>
                    </div>

                    {/* Mining Counter & Individual Control Panel */}
                    <div className="bg-[#050b14] border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-text-muted block">
                          {t("Unclaimed Yield")}
                        </span>
                        <div className="text-base font-black text-brand-gold font-mono">
                          +{unclaimed.toFixed(5)} <span className="text-xs">XRP</span>
                        </div>
                        <span className="text-[9px] text-text-muted">
                          {t("Total Mined")}: {(rig.totalMined || 0).toFixed(4)} XRP
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleMining(rig)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                          title={rig.isMining ? t("Pause Mining") : t("Start Mining")}
                        >
                          {rig.isMining ? <Pause size={14} /> : <Play size={14} className="text-emerald-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleClaim(rig)}
                          disabled={claimingId === rig.id || unclaimed < 0.0001}
                          className="px-3.5 py-2 bg-gradient-to-r from-brand-gold to-amber-500 text-black font-black text-xs rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {claimingId === rig.id ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Sparkles size={13} />
                          )}
                          <span>{t("Claim")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Card (Matching photo) */}
          <div className="bg-[#0b1526] border border-white/10 rounded-3xl p-4 shadow-xl space-y-2.5">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <Activity size={14} className="text-[#00ffff]" />
              <span>{t("Recent Activity")}</span>
            </h4>

            {recentActivities.length === 0 ? (
              <div className="text-center py-4 text-xs text-text-muted">
                No recent mining activity yet.
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white text-[11px] truncate max-w-[200px]">
                        {tx.description}
                      </div>
                      <div className="text-[9px] text-text-muted">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "font-mono font-bold text-xs",
                        tx.amount >= 0 ? "text-emerald-400" : "text-rose-400",
                      )}
                    >
                      {tx.amount >= 0 ? `+${tx.amount.toFixed(4)}` : tx.amount} XRP
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NFT Marketplace & Rigs Box */}
          <div className="bg-gradient-to-r from-[#00ffff]/10 via-[#0b1526] to-brand-gold/10 border border-[#00ffff]/30 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00ffff]/20 border border-[#00ffff]/40 flex items-center justify-center text-[#00ffff]">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">{t("NFT Marketplace")}</h4>
                <p className="text-[10px] text-text-muted leading-tight">
                  {t("Collect 30+ exclusive NFT rigs, boost your mining hashrate and earn passive XRP")}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/nft")}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00ffff] to-cyan-400 text-black font-black text-xs hover:opacity-90 transition-all shrink-0 shadow-md"
            >
              NFT Market &rarr;
            </button>
          </div>
        </div>
      )}

      {/* MINING HISTORY MODAL */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HistoryIcon size={18} className="text-[#00ffff]" />
                  <h3 className="font-bold text-white text-sm">{t("Recent Activity")}</h3>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-text-muted hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2 flex-1">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-10 text-text-muted text-xs">
                    {t("No financial records found")}
                  </div>
                ) : (
                  recentActivities.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white truncate max-w-[200px]">
                          {tx.description}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "font-mono font-bold text-sm",
                          tx.amount >= 0 ? "text-emerald-400" : "text-rose-400",
                        )}
                      >
                        {tx.amount >= 0 ? `+${tx.amount.toFixed(4)}` : tx.amount} XRP
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
