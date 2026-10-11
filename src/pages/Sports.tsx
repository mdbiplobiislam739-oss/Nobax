import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { formatXRP } from '../lib/utils';
import {
  Trophy,
  Activity,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Coins,
  History,
  X,
  Flame,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import {
  fetchLiveMatches,
  fetchUpcomingMatches,
  SportsMatch,
  SportType,
} from '../lib/sportsApi';
import { playSound } from '../lib/audio';

export default function Sports() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'live' | 'upcoming' | 'history'>('live');
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveMatches, setLiveMatches] = useState<SportsMatch[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<SportsMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState<{
    match: SportsMatch;
    market: string;
    outcome: { id: string; label: string; odds: number };
  } | null>(null);
  const [betAmount, setBetAmount] = useState('10');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [userBets, setUserBets] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadAll = async () => {
      try {
        const [live, upcoming] = await Promise.all([
          fetchLiveMatches(),
          fetchUpcomingMatches(),
        ]);
        if (mounted) {
          setLiveMatches(live);
          setUpcomingMatches(upcoming);
        }
      } catch (err) {
        console.error('Error fetching sports matches:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAll();
    const interval = setInterval(loadAll, 12000); // Poll fresh updates
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      const allBets = store.getState().bets || [];
      const sportsBets = allBets.filter(
        (b) => b.userId === user.id && b.game.toLowerCase().startsWith('sports:')
      );
      setUserBets(sportsBets.slice().reverse());
    }
  }, [user, tab]);

  const activeMatches = tab === 'live' ? liveMatches : upcomingMatches;

  const filteredMatches = activeMatches.filter((m) => {
    const matchesSport = selectedSport === 'all' || m.sport === selectedSport;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      m.team1.toLowerCase().includes(q) ||
      m.team2.toLowerCase().includes(q) ||
      m.league.toLowerCase().includes(q);
    return matchesSport && matchesQuery;
  });

  const handlePlaceBet = async () => {
    if (!user || !selectedBet) return;
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      setMsg({ text: 'Please enter a valid bet amount', type: 'error' });
      return;
    }

    if (user.balance < amount) {
      setMsg({
        text: `Insufficient balance. Available: ${formatXRP(user.balance)}`,
        type: 'error',
      });
      return;
    }

    setMsg(null);
    try {
      const estWin = Number((amount * selectedBet.outcome.odds).toFixed(2));
      await store.updateUser(user.id, {
        balance: user.balance - amount,
      });

      await store.addBet({
        userId: user.id,
        username: user.username,
        game: `Sports: ${selectedBet.match.team1} vs ${selectedBet.match.team2} (${selectedBet.outcome.label})`,
        betAmount: amount,
        winAmount: estWin,
        multiplier: selectedBet.outcome.odds,
        status: 'win',
      });

      await store.addTransaction({
        userId: user.id,
        username: user.username,
        type: 'game_win',
        amount: amount,
        status: 'completed',
        description: `Sports Bet on ${selectedBet.match.team1} vs ${selectedBet.match.team2} @ ${selectedBet.outcome.odds}x`,
      });

      playSound('bet');
      await refreshUser();
      setMsg({
        text: `Bet of ${formatXRP(amount)} placed on ${selectedBet.outcome.label} @ ${selectedBet.outcome.odds}x! Potential return: ${formatXRP(estWin)}.`,
        type: 'success',
      });
      setSelectedBet(null);
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to place bet', type: 'error' });
    }
  };

  const getSportBadge = (sport: SportType) => {
    switch (sport) {
      case 'football':
        return { icon: '⚽', label: 'Football', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'cricket':
        return { icon: '🏏', label: 'Cricket', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'basketball':
        return { icon: '🏀', label: 'Basketball', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'tennis':
        return { icon: '🎾', label: 'Tennis', color: 'text-lime-400 bg-lime-500/10 border-lime-500/20' };
      case 'esports':
        return { icon: '🎮', label: 'Esports', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      default:
        return { icon: '🏆', label: 'Sports', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-16">
      {/* Top Banner */}
      <div className="glass-panel p-4 rounded-3xl bg-gradient-to-br from-brand-primary/20 via-[var(--color-bg-card)] to-brand-gold/15 border border-brand-primary/30 shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-primary/20 rounded-xl text-brand-primary">
              <Trophy size={20} />
            </span>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-wide">
                Sports Arena
              </h1>
              <p className="text-[11px] text-text-muted">
                {liveMatches.length} Live & {upcomingMatches.length} Upcoming Matches
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
            Available Balance
          </div>
          <div className="font-extrabold text-brand-gold font-mono text-sm">
            {formatXRP(user?.balance || 0)}
          </div>
        </div>
      </div>

      {/* Mini-Games / Casino Shortcut Card */}
      <div
        onClick={() => navigate('/game')}
        className="cursor-pointer glass-panel p-3 rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#0a1426] to-[#00ffff]/10 border border-[#00ffff]/30 flex items-center justify-between hover:border-[#00ffff] transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
            <Gamepad2 size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Play Instant Casino Games</span>
              <span className="text-[9px] bg-red-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                HOT
              </span>
            </div>
            <div className="text-[10px] text-text-muted">
              Crash, Mines, Slots, Dice & Wheel with instant multiplier payouts
            </div>
          </div>
        </div>
        <span className="text-xs text-[#00ffff] font-extrabold group-hover:translate-x-1 transition-transform">
          Play &rarr;
        </span>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center justify-between border ${
            msg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-[var(--color-bg-card)]/90 p-1.5 rounded-2xl border border-white/15 shadow-md">
        <button
          onClick={() => setTab('live')}
          className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
            tab === 'live'
              ? 'bg-gradient-to-r from-red-600 to-brand-primary text-white shadow-md font-extrabold border-red-500/50'
              : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span>Live ({liveMatches.length})</span>
        </button>

        <button
          onClick={() => setTab('upcoming')}
          className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
            tab === 'upcoming'
              ? 'bg-gradient-to-r from-brand-gold to-amber-300 text-slate-950 shadow-md font-extrabold border-amber-400'
              : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Clock size={13} />
          <span>Upcoming ({upcomingMatches.length})</span>
        </button>

        <button
          onClick={() => setTab('history')}
          className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
            tab === 'history'
              ? 'bg-white/25 text-white shadow-md font-extrabold border-white/30'
              : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <History size={13} />
          <span>My Bets ({userBets.length})</span>
        </button>
      </div>

      {tab !== 'history' && (
        <>
          {/* Sport Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All', icon: '🏆', count: activeMatches.length },
              { id: 'football', label: 'Football', icon: '⚽', count: activeMatches.filter(m => m.sport === 'football').length },
              { id: 'cricket', label: 'Cricket', icon: '🏏', count: activeMatches.filter(m => m.sport === 'cricket').length },
              { id: 'basketball', label: 'Basketball', icon: '🏀', count: activeMatches.filter(m => m.sport === 'basketball').length },
              { id: 'tennis', label: 'Tennis', icon: '🎾', count: activeMatches.filter(m => m.sport === 'tennis').length },
              { id: 'esports', label: 'Esports', icon: '🎮', count: activeMatches.filter(m => m.sport === 'esports').length },
            ].map((cat) => {
              const isSelected = selectedSport === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSport(cat.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border active:scale-95 ${
                    isSelected
                      ? 'bg-white text-slate-950 border-white shadow-md font-extrabold'
                      : 'bg-white/10 text-gray-200 border-white/15 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-black/20 text-slate-950' : 'bg-white/15 text-white'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, club, or tournament..."
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-text-muted outline-none focus:border-brand-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </>
      )}

      {/* Matches List or History */}
      {tab === 'history' ? (
        <div className="space-y-2">
          {userBets.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs text-text-muted border border-[var(--color-border-card)]">
              No sports bets placed yet. Check out the Live or Upcoming matches to place your first bet!
            </div>
          ) : (
            userBets.map((bet) => (
              <div
                key={bet.id}
                className="glass-panel p-3.5 rounded-2xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)]/80 flex justify-between items-center"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-xs text-white truncate">
                    {bet.game}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    Odds: <span className="text-brand-gold font-mono">{bet.multiplier}x</span> • Return: {formatXRP(bet.winAmount)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-xs text-brand-primary">
                    {formatXRP(bet.betAmount)}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                    Active
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-muted">Loading live sports feeds...</span>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-xs text-text-muted border border-[var(--color-border-card)]">
          No matches found matching your filters. Try selecting "All" or clearing the search.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((m) => {
            const badge = getSportBadge(m.sport);
            const marketOutcomes = m.markets['Match Winner'] || [];
            const isLive = m.state === 'in';

            return (
              <div
                key={m.id}
                className="glass-panel p-3.5 rounded-2xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)]/90 hover:border-white/20 transition-all space-y-3"
              >
                {/* Header: Sport badge, League, and State */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-text-muted truncate font-medium max-w-[150px]">
                      {m.league}
                    </span>
                  </div>

                  {isLive ? (
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {m.period} {m.timeMinutes ? `• ${m.timeMinutes}'` : m.overs ? `• ${m.overs} ov` : ''}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-white/10 text-brand-gold border border-brand-gold/20 flex items-center gap-1">
                      <Clock size={10} />
                      {m.timeFormatted || 'Pre-Match'}
                    </span>
                  )}
                </div>

                {/* Team Matchup & Score */}
                <div className="flex items-center justify-between gap-2 py-1">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-white truncate text-left">
                      {m.team1}
                    </div>
                  </div>

                  <div className="px-3 py-1 bg-black/40 rounded-xl border border-white/10 shrink-0 text-center">
                    {isLive ? (
                      <div className="font-mono font-extrabold text-sm text-brand-gold tracking-widest">
                        {m.score1 ?? 0} - {m.score2 ?? 0}
                      </div>
                    ) : (
                      <div className="font-mono font-bold text-xs text-text-muted px-1">
                        VS
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-right">
                    <div className="font-bold text-xs text-white truncate text-right">
                      {m.team2}
                    </div>
                  </div>
                </div>

                {/* Match Winner Odds Buttons */}
                <div>
                  <div className="text-[10px] text-text-muted font-bold mb-1.5 uppercase tracking-wider flex justify-between">
                    <span>1X2 Match Winner</span>
                    <span className="text-[9px] text-brand-gold">Instant Payout</span>
                  </div>
                  <div
                    className={`grid gap-1.5 ${
                      marketOutcomes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                    }`}
                  >
                    {marketOutcomes.map((o) => {
                      const isSelected =
                        selectedBet?.match.id === m.id &&
                        selectedBet?.outcome.id === o.id;
                      return (
                        <button
                          key={o.id}
                          onClick={() =>
                            setSelectedBet({
                              match: m,
                              market: 'Match Winner',
                              outcome: o,
                            })
                          }
                          className={`py-2 px-1.5 rounded-xl text-xs border text-center transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-brand-primary to-brand-gold text-black border-transparent font-extrabold shadow-lg scale-[1.02]'
                              : 'bg-black/40 border-white/10 text-white hover:border-white/30 hover:bg-white/5 active:scale-95'
                          }`}
                        >
                          <div
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-black/80 font-bold' : 'text-text-muted'
                            }`}
                          >
                            {o.label}
                          </div>
                          <div className="font-mono font-bold text-xs mt-0.5">
                            {o.odds.toFixed(2)}x
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Bet Slip Bottom Sheet / Floating Panel */}
      {selectedBet && (
        <div className="fixed bottom-16 left-0 right-0 z-50 flex justify-center px-3">
          <div className="w-full max-w-[400px] glass-panel p-4 rounded-3xl border border-brand-primary/50 bg-[#0c1427]/95 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins size={16} className="text-brand-primary" />
                <span className="font-extrabold text-white text-xs tracking-wide">
                  Active Bet Slip
                </span>
              </div>
              <button
                onClick={() => setSelectedBet(null)}
                className="p-1 text-text-muted hover:text-white rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10 text-xs flex justify-between items-center">
              <div className="min-w-0 pr-2">
                <div className="font-bold text-white truncate text-xs">
                  {selectedBet.match.team1} vs {selectedBet.match.team2}
                </div>
                <div className="text-[11px] text-brand-primary font-bold mt-0.5">
                  Pick: {selectedBet.outcome.label}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-text-muted block">Odds</span>
                <span className="font-mono font-extrabold text-brand-gold text-base">
                  {selectedBet.outcome.odds.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Quick Amount Selector Chips */}
            <div className="flex gap-1.5">
              {['5', '10', '25', '50', '100'].map((val) => (
                <button
                  key={val}
                  onClick={() => setBetAmount(val)}
                  className={`flex-1 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                    betAmount === val
                      ? 'bg-brand-primary text-black border-brand-primary'
                      : 'bg-white/5 text-text-muted border-white/10 hover:text-white'
                  }`}
                >
                  +{val}
                </button>
              ))}
              <button
                onClick={() =>
                  setBetAmount(Math.floor(user?.balance || 0).toString())
                }
                className="px-2 py-1 bg-brand-gold/20 text-brand-gold border border-brand-gold/30 rounded-xl text-[10px] font-bold hover:bg-brand-gold/30"
              >
                MAX
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-brand-primary"
                />
              </div>

              <button
                onClick={handlePlaceBet}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-gold text-black font-extrabold text-xs rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-lg flex items-center gap-1.5 shrink-0"
              >
                <span>Place Bet</span>
                <span className="font-mono text-[11px]">
                  ({formatXRP(Number(betAmount) * selectedBet.outcome.odds || 0)})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
