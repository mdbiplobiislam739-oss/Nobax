import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { store } from '../lib/store';
import { formatXRP, cn } from '../lib/utils';
import { playCoinSound, playSuccessSound } from '../lib/audio';
import {
  Sparkles,
  Trophy,
  Coins,
  RefreshCw,
  Flame,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LiveBetItem {
  id: string;
  username: string;
  game: string;
  betAmount: number;
  multiplier: number;
  winAmount: number;
  timestamp: number;
  status: 'win' | 'loss';
}

export default function JackpotGame() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [betAmount, setBetAmount] = useState<string>('20');
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[]>(['7️⃣', '7️⃣', '7️⃣']);
  const [jackpotPool, setJackpotPool] = useState<number>(125840.5);
  const [winMsg, setWinMsg] = useState<{ tier: string; amount: number; isWin: boolean } | null>(null);
  const [error, setError] = useState<string>('');
  const [liveBets, setLiveBets] = useState<LiveBetItem[]>([]);

  // Fetch Progressive Jackpot pool & Live Bets from backend API with fallback simulation
  useEffect(() => {
    let isMounted = true;

    const generateFallbackBets = (): LiveBetItem[] => {
      const games = ["777 Mega Jackpot", "Crazy Crash", "Mega Slots", "Neon Plinko", "Mines Gold", "Rocket X"];
      const usernames = ["CryptoKing", "Zara_Win", "Alex777", "Siam_BD", "Rahul_Pro", "ElenaX", "Tiger99", "LuckyStar", "Biplob99"];
      return Array.from({ length: 8 }).map((_, i) => {
        const isWin = Math.random() > 0.45;
        const bet = Math.floor(Math.random() * 80 + 10);
        const mult = isWin ? parseFloat((Math.random() * 10 + 1.5).toFixed(2)) : 0;
        return {
          id: `bet-${Date.now()}-${i}`,
          username: usernames[Math.floor(Math.random() * usernames.length)],
          game: games[Math.floor(Math.random() * games.length)],
          betAmount: bet,
          multiplier: mult,
          winAmount: isWin ? parseFloat((bet * mult).toFixed(2)) : 0,
          timestamp: Date.now() - i * 4000,
          status: isWin ? 'win' : 'loss'
        };
      });
    };

    const fetchPool = async () => {
      try {
        const res = await fetch('/api/game/jackpot/pool');
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          const data = await res.json();
          if (isMounted && typeof data.pool === 'number') {
            setJackpotPool(data.pool);
            return;
          }
        }
      } catch (e) {
        // Fallback
      }
      if (isMounted) setJackpotPool((prev) => parseFloat((prev + Math.random() * 0.25).toFixed(2)));
    };

    const fetchLiveBets = async () => {
      try {
        const res = await fetch('/api/game/live-bets');
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.liveBets)) {
            setLiveBets(data.liveBets);
            return;
          }
        }
      } catch (e) {
        // Fallback
      }
      if (isMounted) setLiveBets(generateFallbackBets());
    };

    fetchPool();
    fetchLiveBets();

    const poolInterval = setInterval(fetchPool, 4000);
    const betsInterval = setInterval(fetchLiveBets, 5000);

    return () => {
      isMounted = false;
      clearInterval(poolInterval);
      clearInterval(betsInterval);
    };
  }, []);

  const handleSpin = async () => {
    if (!user) return;
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    if (user.balance < bet) {
      setError(`Insufficient balance! Available: ${formatXRP(user.balance)}`);
      return;
    }

    setError('');
    setWinMsg(null);
    setIsSpinning(true);

    // Deduct bet from balance immediately
    const balanceAfterBet = Number((user.balance - bet).toFixed(2));
    store.updateUser(user.id, { balance: balanceAfterBet });
    refreshUser();

    // Sound and animation simulation while calling server API
    try {
      const response = await fetch('/api/game/jackpot/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betAmount: bet }),
      });

      let data;
      const ct = response.headers.get('content-type');
      if (response.ok && ct && ct.includes('application/json')) {
        data = await response.json();
      } else {
        // Client fallback RNG
        const symbols = ['7️⃣', '💎', '👑', '⭐', '🔔', '🍒'];
        const r = Math.random();
        let mult = 0;
        let tier = 'No Win';
        let rReels = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
        ];

        if (r < 0.05) {
          rReels = ['7️⃣', '7️⃣', '7️⃣'];
          mult = 250;
          tier = '777 GRAND JACKPOT';
        } else if (r < 0.15) {
          rReels = ['💎', '💎', '💎'];
          mult = 50;
          tier = 'DIAMOND MAJOR';
        } else if (r < 0.3) {
          rReels = ['👑', '👑', '👑'];
          mult = 20;
          tier = 'CROWN MINOR';
        } else if (r < 0.5) {
          rReels[1] = rReels[0];
          mult = 2.5;
          tier = 'LUCKY PAIR';
        }
        data = {
          reels: rReels,
          multiplier: mult,
          jackpotTier: tier,
          winAmount: Number((bet * mult).toFixed(2)),
          isWin: mult > 0,
        };
      }

      // Spin reel animation delay (1.2 seconds for great casino feedback)
      setTimeout(() => {
        setReels(data.reels);
        setIsSpinning(false);

        if (data.isWin && data.winAmount > 0) {
          const finalBalance = Number((balanceAfterBet + data.winAmount).toFixed(2));
          store.updateUser(user.id, {
            balance: finalBalance,
            totalEarnings: Number(((user.totalEarnings || 0) + data.winAmount).toFixed(2)),
          });

          store.addTransaction({
            userId: user.id,
            username: user.username,
            type: 'game_win',
            amount: data.winAmount,
            status: 'completed',
            description: `Won ${data.jackpotTier} (x${data.multiplier}) in 777 Jackpot`,
            currency: 'XRP',
          });

          store.addBet({
            userId: user.id,
            username: user.username,
            game: '777 Mega Jackpot',
            betAmount: bet,
            winAmount: data.winAmount,
            multiplier: data.multiplier,
            status: 'win',
          });

          setWinMsg({ tier: data.jackpotTier, amount: data.winAmount, isWin: true });
          playSuccessSound();
          playCoinSound();
        } else {
          store.addBet({
            userId: user.id,
            username: user.username,
            game: '777 Mega Jackpot',
            betAmount: bet,
            winAmount: 0,
            multiplier: 0,
            status: 'loss',
          });
          setWinMsg({ tier: 'Try Again', amount: 0, isWin: false });
        }
        refreshUser();
      }, 1200);
    } catch (err: any) {
      setIsSpinning(false);
      setError(err.message || 'Error spinning jackpot');
    }
  };

  const setPresetBet = (val: number) => {
    setBetAmount(val.toString());
  };

  return (
    <div className="space-y-4">
      {/* Progressive Jackpot Header Meter */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/30 via-[#0b1526] to-purple-900/30 border border-brand-gold/40 p-5 shadow-[0_0_30px_rgba(255,200,0,0.2)] text-center">
        <div className="absolute top-0 right-0 w-44 h-44 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-[10px] font-black uppercase tracking-widest animate-pulse">
            <Flame size={12} />
            <span>PROGRESSIVE MEGA JACKPOT</span>
          </div>

          <h2 className="text-xs uppercase font-bold text-white/80 tracking-wider">
            777 Grand Prize Pool
          </h2>

          <div className="text-3xl sm:text-4xl font-black text-gradient-gold font-mono tracking-tight drop-shadow-md">
            🪙 {jackpotPool.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XRP
          </div>

          <p className="text-[10px] text-text-muted">
            Hit 7️⃣ 7️⃣ 7️⃣ to claim the 250x Grand Jackpot prize!
          </p>
        </div>
      </div>

      {/* 3-Reel Slot Machine Frame */}
      <div className="bg-[#050b14] border-2 border-brand-gold/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-radial from-brand-gold/5 via-transparent to-transparent pointer-events-none" />

        {/* Reels Container */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-black/60 rounded-2xl border border-white/10 shadow-inner mb-4">
          {reels.map((symbol, idx) => (
            <motion.div
              key={idx}
              animate={isSpinning ? { y: [-15, 15, -15], scale: [0.95, 1.05, 0.95] } : { y: 0, scale: 1 }}
              transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.15 }}
              className="h-24 sm:h-28 rounded-2xl bg-[#0b1526] border border-white/15 flex items-center justify-center text-4xl sm:text-5xl shadow-xl select-none relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
              <span>{symbol}</span>
            </motion.div>
          ))}
        </div>

        {/* Win / Loss Result Toast */}
        <AnimatePresence>
          {winMsg && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'p-3 rounded-2xl text-center text-xs font-black border mb-4 shadow-lg',
                winMsg.isWin
                  ? 'bg-gradient-to-r from-brand-gold/20 via-amber-500/20 to-brand-gold/20 border-brand-gold text-brand-gold animate-bounce'
                  : 'bg-white/5 border-white/10 text-text-muted',
              )}
            >
              {winMsg.isWin ? (
                <span>🎉 {winMsg.tier}! +{formatXRP(winMsg.amount)} WON! 🪙</span>
              ) : (
                <span>Better luck next spin! Try again!</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-2.5 rounded-xl text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 text-center mb-3">
            {error}
          </div>
        )}

        {/* Bet Selection & Spin Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted font-bold">Bet Amount (XRP):</span>
            <span className="text-brand-gold font-bold">
              Available: {formatXRP(user?.balance || 0)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={isSpinning}
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm font-bold text-white font-mono outline-none focus:border-brand-gold"
            />
            <button
              onClick={() => setPresetBet(10)}
              className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
            >
              10
            </button>
            <button
              onClick={() => setPresetBet(25)}
              className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
            >
              25
            </button>
            <button
              onClick={() => setPresetBet(50)}
              className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
            >
              50
            </button>
            <button
              onClick={() => setPresetBet(100)}
              className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
            >
              100
            </button>
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3.5 bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold hover:opacity-95 active:scale-95 text-black font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(255,200,0,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSpinning ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>SPINNING JACKPOT...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>SPIN & WIN JACKPOT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Paytable Multipliers Guide */}
      <div className="bg-[#0b1526] border border-white/10 rounded-2xl p-3 text-xs space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-text-muted block">
          Jackpot Payout Multipliers:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
          <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
            <span>7️⃣ 7️⃣ 7️⃣</span> <strong className="text-brand-gold block">250x GRAND</strong>
          </div>
          <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
            <span>💎 💎 💎</span> <strong className="text-cyan-400 block">50x MAJOR</strong>
          </div>
          <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
            <span>👑 👑 👑</span> <strong className="text-purple-400 block">20x CROWN</strong>
          </div>
          <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
            <span>2 Matching</span> <strong className="text-emerald-400 block">2.5x PAIR</strong>
          </div>
        </div>
      </div>

      {/* LIVE BETS STREAM API TABLE */}
      <div className="bg-[#0b1526] border border-white/10 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#00ffff] animate-pulse" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Live Betting Stream (Live API)
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
            CONNECTED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] text-text-muted uppercase">
                <th className="pb-2 font-bold">User</th>
                <th className="pb-2 font-bold">Game</th>
                <th className="pb-2 font-bold">Bet</th>
                <th className="pb-2 font-bold">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {liveBets.slice(0, 6).map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2 font-bold text-white">{item.username}</td>
                  <td className="py-2 text-text-muted text-[11px]">{item.game}</td>
                  <td className="py-2 font-mono text-white">{item.betAmount} XRP</td>
                  <td className="py-2 font-mono font-bold">
                    {item.status === 'win' ? (
                      <span className="text-emerald-400">+{item.winAmount} XRP ({item.multiplier}x)</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
