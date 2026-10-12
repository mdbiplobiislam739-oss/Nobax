import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { formatXRP } from '../lib/utils';
import {
  Trophy,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Coins,
  History,
  X,
  Gamepad2,
  ChevronRight,
  TrendingUp,
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
    const interval = setInterval(loadAll, 20000);
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
        return { icon: '⚽', label: 'Football', color: 'text-emerald-400 bg-emerald-500/10' };
      case 'cricket':
        return { icon: '🏏', label: 'Cricket', color: 'text-amber-400 bg-amber-500/10' };
      case 'basketball':
        return { icon: '🏀', label: 'Basketball', color: 'text-orange-400 bg-orange-500/10' };
      case 'tennis':
        return { icon: '🎾', label: 'Tennis', color: 'text-lime-400 bg-lime-500/10' };
      case 'esports':
        return { icon: '🎮', label: 'Esports', color: 'text-purple-400 bg-purple-500/10' };
      default:
        return { icon: '🏆', label: 'Sports', color: 'text-cyan-400 bg-cyan-500/10' };
    }
  };

  return (
    <div className="space-y-3.5 pt-2 pb-28">
      {/* Top Banner: Sleek Dark Sportsbook Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0a1224] border border-slate-800/80 p-4 shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/15 flex items-center justify-center text-brand-primary shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-wide">
                Sports Arena
              </h1>
              <p className="text-[11px] text-text-muted mt-0.5">
                {liveMatches.length} Live • {upcomingMatches.length} Upcoming Fixtures
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
              Balance
            </span>
            <span className="font-mono font-black text-brand-gold text-base">
              {formatXRP(user?.balance || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Instant Casino Games Shortcut */}
      <div
        onClick={() => navigate('/game')}
        className="cursor-pointer rounded-2xl bg-[#091326] border border-slate-800/80 p-3 flex items-center justify-between hover:bg-[#0c1830] transition-all group shadow-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
            <Gamepad2 size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Instant Casino Games</span>
              <span className="text-[9px] bg-red-500/20 text-red-400 font-black px-1.5 py-0.2 rounded-md">
                HOT
              </span>
            </div>
            <div className="text-[10px] text-text-muted">
              Crash, Mines, Slots, Dice & Wheel with instant payouts
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#00ffff] font-black group-hover:translate-x-0.5 transition-transform">
          <span>Play</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center justify-between shadow-lg ${
            msg.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="opacity-70 hover:opacity-100 p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Tabs: Sleek Dark Segment Controller (No Harsh White Outlines) */}
      <div className="grid grid-cols-3 gap-1 bg-[#070e1c] p-1 rounded-2xl border border-slate-800/80 shadow-md">
        <button
          onClick={() => setTab('live')}
          className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            tab === 'live'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg font-black'
              : 'text-gray-400 hover:text-white'
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
          className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            tab === 'upcoming'
              ? 'bg-gradient-to-r from-brand-gold to-amber-500 text-slate-950 shadow-lg font-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Clock size={13} />
          <span>Upcoming ({upcomingMatches.length})</span>
        </button>

        <button
          onClick={() => setTab('history')}
          className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            tab === 'history'
              ? 'bg-gradient-to-r from-brand-primary to-orange-500 text-white shadow-lg font-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <History size={13} />
          <span>My Bets ({userBets.length})</span>
        </button>
      </div>

      {tab !== 'history' && (
        <>
          {/* Sport Filter Chips: Sleek Soft Pills (No harsh white outlines) */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'All', icon: '🏆', count: activeMatches.length },
              { id: 'football', label: 'Football', icon: '⚽', count: activeMatches.filter((m) => m.sport === 'football').length },
              { id: 'cricket', label: 'Cricket', icon: '🏏', count: activeMatches.filter((m) => m.sport === 'cricket').length },
              { id: 'basketball', label: 'Basketball', icon: '🏀', count: activeMatches.filter((m) => m.sport === 'basketball').length },
              { id: 'tennis', label: 'Tennis', icon: '🎾', count: activeMatches.filter((m) => m.sport === 'tennis').length },
              { id: 'esports', label: 'Esports', icon: '🎮', count: activeMatches.filter((m) => m.sport === 'esports').length },
            ].map((cat) => {
              const isSelected = selectedSport === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSport(cat.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-primary to-orange-500 text-white font-black shadow-md'
                      : 'bg-[#091326] text-gray-300 hover:text-white border border-slate-800/80 hover:bg-[#0c1830]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="font-bold">{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-gray-300'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, club, or tournament..."
              className="w-full bg-[#091326] border border-slate-800/80 rounded-2xl pl-10 pr-9 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-brand-primary/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </>
      )}

      {/* Matches List / Bets History */}
      {tab === 'history' ? (
        <div className="space-y-2">
          {userBets.length === 0 ? (
            <div className="p-8 rounded-2xl text-center text-xs text-text-muted bg-[#091326] border border-slate-800/80">
              No sports bets placed yet. Check out Live or Upcoming matches to place your first bet!
            </div>
          ) : (
            userBets.map((bet) => (
              <div
                key={bet.id}
                className="p-3.5 rounded-2xl bg-[#091326] border border-slate-800/80 flex items-center justify-between text-xs shadow-md"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-white truncate text-xs">
                    {bet.game}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    Odds: <span className="text-brand-gold font-mono font-bold">{bet.multiplier}x</span> • Return: {formatXRP(bet.winAmount)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-xs text-brand-primary">
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
        <div className="p-8 rounded-2xl text-center text-xs text-text-muted bg-[#091326] border border-slate-800/80">
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
                className="p-3.5 rounded-2xl bg-[#0a1224] border border-slate-800/80 hover:border-slate-700 transition-all space-y-3 shadow-lg"
              >
                {/* Header: Sport badge & Status */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${badge.color}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-text-muted truncate font-medium max-w-[150px]">
                      {m.league}
                    </span>
                  </div>

                  {isLive ? (
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[9px] bg-red-500/15 text-red-400 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>{m.period} {m.timeMinutes ? `• ${m.timeMinutes}'` : m.overs ? `• ${m.overs} ov` : ''}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-amber-500/10 text-brand-gold flex items-center gap-1">
                      <Clock size={10} />
                      <span>{m.timeFormatted || 'Pre-Match'}</span>
                    </span>
                  )}
                </div>

                {/* Team Matchup & Live Score */}
                <div className="flex items-center justify-between gap-2 py-1">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-white truncate text-left">
                      {m.team1}
                    </div>
                  </div>

                  <div className="px-3 py-1 bg-[#060c18] rounded-xl shrink-0 text-center border border-slate-800">
                    {isLive ? (
                      <div className="font-mono font-black text-sm text-brand-gold tracking-widest">
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

                {/* Match Winner Odds Buttons (Sleek Dark Glass, No stark white outlines) */}
                <div>
                  <div className="text-[10px] text-text-muted font-bold mb-1.5 uppercase tracking-wider flex justify-between">
                    <span>1X2 Match Winner</span>
                    <span className="text-[9px] text-brand-gold font-bold flex items-center gap-1">
                      <TrendingUp size={10} />
                      <span>Instant Settlement</span>
                    </span>
                  </div>
                  <div
                    className={`grid gap-2 ${
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
                          onClick={() => {
                            playSound('tick');
                            setSelectedBet({
                              match: m,
                              market: 'Match Winner',
                              outcome: o,
                            });
                          }}
                          className={`py-2 px-1.5 rounded-xl text-xs text-center transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-orange-500/25 scale-[1.02]'
                              : 'bg-[#060d1b] border border-slate-800/90 text-gray-200 hover:bg-[#0a1529] hover:border-slate-700 active:scale-95'
                          }`}
                        >
                          <div
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-slate-950 font-black' : 'text-text-muted font-semibold'
                            }`}
                          >
                            {o.label}
                          </div>
                          <div
                            className={`font-mono font-black text-xs mt-0.5 ${
                              isSelected ? 'text-slate-950' : 'text-brand-gold'
                            }`}
                          >
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

      {/* Interactive Bet Slip Bottom Sheet with Dark Dim Backdrop (Completely eliminates background overlap) */}
      {selectedBet && (
        <>
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setSelectedBet(null)}
          />

          {/* Bottom Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-0">
            <div className="w-full max-w-[400px] bg-[#0c1527] border-t border-brand-primary/40 rounded-t-3xl shadow-[0_-15px_50px_rgba(0,0,0,0.95)] p-4 space-y-3 pb-safe pb-6 animate-in slide-in-from-bottom duration-200">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <Coins size={16} />
                  </div>
                  <div>
                    <span className="font-black text-white text-xs tracking-wide">
                      Active Bet Slip
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold ml-2">
                      Ready to Place
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBet(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-slate-800/60"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Match Summary Box */}
              <div className="p-3 bg-[#070e1c] rounded-2xl border border-slate-800 text-xs flex justify-between items-center">
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-white truncate text-xs">
                    {selectedBet.match.team1} vs {selectedBet.match.team2}
                  </div>
                  <div className="text-[11px] text-brand-primary font-bold mt-0.5">
                    Pick: {selectedBet.outcome.label}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] text-text-muted block uppercase font-bold">Odds</span>
                  <span className="font-mono font-black text-brand-gold text-base">
                    {selectedBet.outcome.odds.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Quick Amount Selector Chips (No stark white outlines) */}
              <div className="flex gap-1.5">
                {['5', '10', '25', '50', '100'].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      playSound('tick');
                      setBetAmount(val);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      betAmount === val
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black shadow-md'
                        : 'bg-[#070e1c] text-gray-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    +{val}
                  </button>
                ))}
                <button
                  onClick={() => {
                    playSound('tick');
                    setBetAmount(Math.floor(user?.balance || 0).toString());
                  }}
                  className="px-2.5 py-1.5 bg-brand-gold/15 text-brand-gold rounded-xl text-xs font-black hover:bg-brand-gold/25"
                >
                  MAX
                </button>
              </div>

              {/* Amount Input & Place Bet Button */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full bg-[#070e1c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold outline-none focus:border-brand-primary"
                  />
                </div>

                <button
                  onClick={handlePlaceBet}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-slate-950 font-black text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-orange-500/25 flex items-center gap-1.5 shrink-0"
                >
                  <span>Place Bet</span>
                  <span className="font-mono text-[11px] font-black">
                    ({formatXRP(Number(betAmount) * selectedBet.outcome.odds || 0)})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
