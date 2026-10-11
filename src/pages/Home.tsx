import { useAuth } from "../contexts/AuthContext";
import { store, VIP_LEVELS } from "../lib/store";
import { formatXRP } from "../lib/utils";
import {
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  ChevronRight,
  ShoppingBag,
  Lock,
  Zap,
  Gift,
  Trophy,
  Users,
  DollarSign,
  RefreshCcw,
  ArrowRightLeft,
  Headset,
  Gamepad2,
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Transaction } from "../types";
import heroBg from "../assets/images/trx_heroes_background_1781765288717.jpg";

import { useTranslation } from "../contexts/TranslationContext";
import { CRYPTO_TOKENS, useTokens } from "../lib/tokens";
import { usePreferredCurrency } from '../hooks/usePreferredCurrency';
import CryptoMarketSection from '../components/CryptoMarketSection';

function HistoryModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const transactions = store
    .getState()
    .transactions.filter((t) => t.userId === user?.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[100]">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border-card)] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">History</h3>
          <button
            onClick={onClose}
            className="p-2 bg-[var(--color-bg-base)] rounded-full text-text-muted hover:text-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              No history found
            </div>
          ) : (
            transactions.map((tx) => {
              const tokenSymbol = tx.description?.includes("(")
                ? tx.description.match(/\((.*?)\)/)?.[1] ||
                  tx.description.split(" for ")?.[1] ||
                  "XRP"
                : "XRP";
              return (
                <div
                  key={tx.id}
                  className="bg-[var(--color-bg-base)] border border-[var(--color-border-card)] p-4 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm capitalize text-brand-gold">
                      {tx.type}{" "}
                      <span className="text-[10px] text-brand-primary">
                        ({tokenSymbol})
                      </span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                    <span
                      className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        tx.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : tx.status === "completed"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <div
                    className={`font-bold ${tx.type === "withdraw" || tx.amount < 0 ? "text-red-500" : "text-green-500"}`}
                  >
                    {tx.type === "withdraw" || tx.amount < 0 ? "-" : "+"}
                    {tokenSymbol === "XRP"
                      ? formatXRP(Math.abs(tx.amount))
                      : `${Math.abs(tx.amount)} ${tokenSymbol}`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function NewsOffersSection({ state }: { state: any }) {
  const { t } = useTranslation();
  const newsItems = [
    ...(state.billboardEnabled && state.billboardText
      ? [{ title: "System Update", text: state.billboardText }]
      : []),
    ...(state.notices
      ?.filter((n: any) => n.isActive)
      .map((n: any) => ({ title: "Announcement", text: n.text })) || []),
  ];

  if (newsItems.length === 0) return null;

  const Marquee = "marquee" as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 mt-4"
    >
      <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] border border-[#00FFFF]/20 relative flex flex-col h-[100px] sm:h-[140px] transition-all hover:shadow-[0_0_40px_rgba(0,240,255,0.25)] group">
        {/* Background Image Layer (No Animation for performance) */}
        <div
          className="absolute inset-0 z-0 origin-center"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Static XRP Logo */}
        <div className="absolute right-[-10px] sm:right-[-20px] top-0 bottom-0 flex items-center justify-center z-[5] opacity-20 md:opacity-30 pointer-events-none overflow-hidden">
          <img
            src="https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png"
            alt="XRP"
            className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 brightness-0 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]"
          />
        </div>

        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/90 via-black/30 to-black/50 z-0" />

        <div className="relative z-10 flex-1 min-w-0 flex flex-col p-4 sm:p-5 justify-start h-full pointer-events-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#00FFFF] font-bold tracking-wide uppercase drop-shadow mb-3 sm:mb-4">
            <Megaphone size={14} className="text-[#00FFFF] animate-pulse sm:w-4 sm:h-4" />
            {t("Live Updates")}
          </div>

          <div className="flex-1 overflow-hidden relative">
            <Marquee direction="up" scrollamount="2" className="h-full w-full">
              <div className="flex flex-col gap-4 sm:gap-6 pb-4 pr-2">
                {newsItems.map((item, i) => (
                  <div key={i} className="flex flex-col">
                    {item.title && (
                      <span className="text-[#00FFFF] font-bold text-[14px] sm:text-[16px] md:text-[18px] drop-shadow mb-1">
                        {item.title}:
                      </span>
                    )}
                    <span className="text-white/90 text-[13px] sm:text-[15px] md:text-[17px] font-medium leading-relaxed whitespace-pre-wrap drop-shadow-md break-words">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </Marquee>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextDay = new Date();
      nextDay.setDate(now.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const diff = nextDay.getTime() - now.getTime();

      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{timeLeft}</span>;
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tokens = useTokens();
  const [selectedBalanceTokenId, setSelectedBalanceTokenId] = usePreferredCurrency('XRP');
  const selectedBalanceToken = tokens.find(t => t.symbol === selectedBalanceTokenId) || tokens[0];
  const { t } = useTranslation();
  const state = store.getState();
  const userVip =
    state.vipLevels?.find((v) => v.level === user?.vipLevel) ||
    state.vipLevels?.[0] ||
    VIP_LEVELS[0];
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="space-y-3 sm:space-y-5 pb-20">
      <NewsOffersSection state={state} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative rounded-2xl sm:rounded-3xl p-4 overflow-hidden bg-gradient-to-br from-[#FF0013] to-[#80000A] shadow-[0_15px_35px_-10px_rgba(255,0,19,0.4)] backdrop-blur-md"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <svg
            width="100"
            height="100"
            className="sm:w-[120px] sm:h-[120px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 12 12 22 22 12 12 2" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1">
            <div className="text-white/80 text-xs sm:text-sm font-medium">
              {t("Total Balance")}
            </div>
            <select
                value={selectedBalanceTokenId}
                onChange={(e) => setSelectedBalanceTokenId(e.target.value)}
                className="bg-white/20 border-none text-white font-bold text-xs px-2 py-1 rounded-md outline-none"
            >
                {tokens.map(t => (
                    <option key={t.symbol} value={t.symbol} className="text-black">{t.symbol}</option>
                ))}
            </select>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow-md truncate">
            {selectedBalanceTokenId === "XRP" 
               ? formatXRP(user?.balance || 0) 
               : `${(user?.balances?.[selectedBalanceTokenId] || 0).toFixed(2)} ${selectedBalanceTokenId}`}
          </div>

          <div className="flex gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => navigate("/finance/deposit")}
              className="flex-1 min-w-[30%] bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-md border border-white/20 text-xs active:scale-95"
            >
              <ArrowDownRight size={14} className="text-emerald-400" /> {t("Deposit")}
            </button>
            <button
              onClick={() => navigate("/finance/withdraw")}
              className="flex-1 min-w-[30%] bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-md border border-white/20 text-xs active:scale-95"
            >
              <ArrowUpRight size={14} className="text-rose-400" /> {t("Withdraw")}
            </button>
            <button
              onClick={() => navigate("/finance/transfer")}
              className="flex-1 min-w-[30%] bg-brand-gold/30 hover:bg-brand-gold/40 backdrop-blur-md text-white py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-md border border-brand-gold/30 text-xs active:scale-95"
            >
              <ArrowRightLeft size={14} className="text-amber-300" /> {t("Transfer")}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 sm:grid-cols-4 gap-y-4 gap-x-2">
        <QuickAction
          icon={<ArrowUpRight />}
          label={t("Send")}
          onClick={() => navigate("/finance/withdraw")}
          color="text-white"
          bg="bg-white/10"
        />
        <QuickAction
          icon={<ArrowDownRight />}
          label={t("Receive")}
          onClick={() => navigate("/finance/deposit")}
          color="text-white"
          bg="bg-white/10"
        />
        <QuickAction
          icon={<RefreshCcw />}
          label={t("Swap")}
          onClick={() => navigate("/swap")}
          color="text-white"
          bg="bg-brand-primary/20"
        />
        <QuickAction
          icon={<Activity />}
          label={t("History")}
          onClick={() => setIsHistoryOpen(true)}
          color="text-white"
          bg="bg-white/10"
        />
        <QuickAction
          icon={<ShoppingBag />}
          label={t("Buy")}
          onClick={() => navigate("/shop")}
          color="text-white"
          bg="bg-white/10"
        />
        <QuickAction
          icon={<Users />}
          label={t("Team")}
          onClick={() => navigate("/team")}
          color="text-brand-primary"
          bg="bg-brand-primary/10"
        />
        <QuickAction
          icon={<Zap />}
          label={t("Stake")}
          onClick={() => navigate("/stake")}
          color="text-[#fcd535]"
          bg="bg-[#fcd535]/10"
        />
        <QuickAction
          icon={<Gift />}
          label={t("Bonus") || "Bonus"}
          onClick={() => navigate("/bonus")}
          color="text-[#FF007A]"
          bg="bg-[#FF007A]/10"
        />
        <QuickAction
          icon={<Megaphone />}
          label={t("News") || "News"}
          onClick={() => navigate("/news")}
          color="text-[#00FFFF]"
          bg="bg-[#00FFFF]/10"
        />
        <QuickAction
          icon={<Trophy />}
          label={t("Leaderboard") || "Rankings"}
          onClick={() => navigate("/leaderboard")}
          color="text-[#FF007A]"
          bg="bg-[#FF007A]/10"
        />
        <QuickAction
          icon={<Gamepad2 />}
          label={t("Sports")}
          onClick={() => navigate("/sports")}
          color="text-brand-gold"
          bg="bg-brand-gold/10"
        />
        <QuickAction
          icon={<Headset />}
          label={t("Support")}
          onClick={() => window.open('https://t.me/TRXHubSupport', '_blank')}
          color="text-[#00FFFF]"
          bg="bg-[#00FFFF]/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {/* Animated NFT Mining Card */}
        <Link
          to="/mining"
          className="glass-panel p-3 sm:p-4 rounded-2xl sm:rounded-3xl overflow-hidden relative group block hover:border-[#00ffff]/40 transition-all"
        >
          <div className="absolute inset-0 bg-[#00ffff]/5 pointer-events-none group-hover:bg-[#00ffff]/10 transition-colors" />
          <div className="flex justify-between items-center mb-3 relative z-10">
            <div className="flex items-center gap-1 sm:gap-2 text-text-muted">
              <Zap size={14} className="text-[#00ffff] animate-pulse sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-bold truncate text-white">
                {t("NFT Mining")}
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold bg-[#00ffff]/20 text-[#00ffff] px-1.5 py-0.5 rounded-full">
              LIVE
            </div>
          </div>

          <div className="relative z-10">
            <div className="h-1.5 sm:h-2 w-full bg-[var(--color-bg-base)] rounded-full overflow-hidden mb-2 relative">
              <motion.div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#00ffff] to-brand-gold rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 86400,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-text-muted font-bold font-mono">
              <span className="truncate mr-1 text-[#00ffff]">{t("Start NFT Mining")}</span>
              <span>&rarr;</span>
            </div>
          </div>
        </Link>

        <div className="glass-panel p-3 sm:p-4 rounded-2xl sm:rounded-3xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-green-500/5 pointer-events-none group-hover:bg-green-500/10 transition-colors" />
          <div className="flex items-center gap-1 sm:gap-2 text-text-muted mb-2 relative z-10">
            <Activity size={14} className="text-green-500 shrink-0 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-bold truncate whitespace-nowrap">
              Pickups
            </span>
          </div>
          <div
            className="text-lg sm:text-2xl font-bold text-white truncate drop-shadow relative z-10 pt-1"
            title={formatXRP(user?.totalEarnings || 0)}
          >
            {formatXRP(user?.totalEarnings || 0)}
          </div>
        </div>
      </div>

      <Link
        to="/nft"
        className="block glass-panel p-4 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden group border border-[#00ffff]/30"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff]/10 via-transparent to-brand-gold/10 pointer-events-none group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between relative z-10">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-[#00ffff] font-extrabold text-xs uppercase tracking-wider mb-0.5">
              <span className="p-1 rounded-md bg-[#00ffff]/20">✨</span>
              <span>NFT Marketplace</span>
            </div>
            <div className="text-white font-black text-base sm:text-lg truncate">
              Collect Rigs & Boost Hash Power
            </div>
            <div className="text-xs text-text-muted mt-1 truncate">
              Explore 30+ Original NFTs • <span className="text-emerald-400 font-bold font-mono">Earn Daily XRP</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-[var(--color-bg-base)] rounded-full flex items-center justify-center border border-[#00ffff]/40 group-hover:scale-105 transition-transform">
            <ChevronRight
              size={18}
              className="text-[#00ffff] group-hover:translate-x-0.5 transition-transform sm:w-5 sm:h-5"
            />
          </div>
        </div>
      </Link>

      {/* Official Partners / Supported Platforms */}
      <div className="py-2 overflow-hidden">
        <p className="text-center font-bold text-text-muted text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 justify-center whitespace-nowrap">
          <span className="h-[1px] w-4 sm:w-8 bg-gradient-to-r from-transparent to-[var(--color-border-card)]"></span>
          Supported Networks
          <span className="h-[1px] w-4 sm:w-8 bg-gradient-to-l from-transparent to-[var(--color-border-card)]"></span>
        </p>
        <div className="flex justify-center gap-4 sm:gap-6 items-center flex-wrap">
          <div className="flex items-center gap-1.5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <div className="w-5 h-5 bg-[#3BCCAA] rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-black">T</span>
            </div>
            <span className="font-bold text-white tracking-widest text-sm">
              TRC20
            </span>
          </div>

          <div className="flex items-center gap-1.5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <div className="w-5 h-5 bg-[#627EEA] rounded-full flex items-center justify-center">
              <div className="w-2.5 h-4 border-2 border-white rounded-[1px] transform -skew-x-12"></div>
            </div>
            <span className="font-bold text-white tracking-widest text-sm">
              ERC20
            </span>
          </div>

          <div className="flex items-center gap-1.5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <div className="w-5 h-5 bg-[#F0B90B] rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 m-auto w-2.5 h-2.5 bg-black rotate-45"></div>
              <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-[#F0B90B] rotate-45"></div>
            </div>
            <span className="font-bold text-white tracking-widest text-sm">
              BEP20
            </span>
          </div>
        </div>
      </div>

      {/* Crypto Markets Section (Replacing live trades with Market list) */}
      <CryptoMarketSection />

      {isHistoryOpen && (
        <HistoryModal onClose={() => setIsHistoryOpen(false)} />
      )}
    </div>
  );
}

function QuickAction({ icon, label, onClick, color, bg }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 sm:gap-2 group w-full"
    >
      <div
        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full ${bg} ${color} flex items-center justify-center group-hover:scale-105 transition-transform border border-white/10`}
      >
        {icon}
      </div>
      <span className="text-[10px] sm:text-[11px] font-medium text-white transition-colors">
        {label}
      </span>
    </button>
  );
}
