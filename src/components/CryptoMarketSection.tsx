import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, TrendingUp, BarChart3, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';

interface MarketCoin {
  symbol: string;
  base: string;
  quote: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: string;
  icon: string;
  color: string;
}

const DEFAULT_COINS: MarketCoin[] = [
  { symbol: 'XRPUSDT', base: 'XRP', quote: 'USDT', name: 'Ripple', price: 1.4520, change24h: 5.62, volume24h: '385.4M', icon: '✕', color: 'bg-blue-600' },
  { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT', name: 'Bitcoin', price: 68420.00, change24h: 2.84, volume24h: '1.82B', icon: '₿', color: 'bg-orange-500' },
  { symbol: 'ETHUSDT', base: 'ETH', quote: 'USDT', name: 'Ethereum', price: 3512.50, change24h: 3.41, volume24h: '942.1M', icon: 'Ξ', color: 'bg-indigo-600' },
  { symbol: 'SOLUSDT', base: 'SOL', quote: 'USDT', name: 'Solana', price: 154.80, change24h: 7.15, volume24h: '512.3M', icon: '◎', color: 'bg-purple-600' },
  { symbol: 'BNBUSDT', base: 'BNB', quote: 'USDT', name: 'BNB Chain', price: 582.40, change24h: 1.95, volume24h: '248.6M', icon: '🔶', color: 'bg-yellow-500' },
  { symbol: 'DOGEUSDT', base: 'DOGE', quote: 'USDT', name: 'Dogecoin', price: 0.1845, change24h: -1.24, volume24h: '194.8M', icon: '🐕', color: 'bg-amber-600' },
  { symbol: 'TRXUSDT', base: 'TRX', quote: 'USDT', name: 'TRON', price: 0.1648, change24h: 4.12, volume24h: '142.5M', icon: '💎', color: 'bg-red-500' },
  { symbol: 'PEPEUSDT', base: 'PEPE', quote: 'USDT', name: 'Pepe', price: 0.0000104, change24h: 12.85, volume24h: '98.4M', icon: '🐸', color: 'bg-emerald-600' },
];

export default function CryptoMarketSection() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'hot' | 'gainers' | 'volume'>('hot');
  const [coins, setCoins] = useState<MarketCoin[]>(DEFAULT_COINS);

  useEffect(() => {
    let mounted = true;

    // Connect to Binance WebSocket for real-time 24hr mini tickers
    const symbols = ['xrpusdt', 'btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'dogeusdt', 'trxusdt'];
    const streamNames = symbols.map(s => `${s}@ticker`).join('/');
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamNames}`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.s) {
            const sym = data.s.toUpperCase();
            const lastPrice = parseFloat(data.c);
            const priceChangePercent = parseFloat(data.P);
            const rawVol = parseFloat(data.q);

            let volStr = '';
            if (rawVol >= 1e9) {
              volStr = (rawVol / 1e9).toFixed(2) + 'B';
            } else if (rawVol >= 1e6) {
              volStr = (rawVol / 1e6).toFixed(1) + 'M';
            } else {
              volStr = (rawVol / 1e3).toFixed(1) + 'K';
            }

            if (mounted) {
              setCoins(prev =>
                prev.map(c => {
                  if (c.symbol === sym) {
                    return {
                      ...c,
                      price: lastPrice,
                      change24h: priceChangePercent,
                      volume24h: volStr || c.volume24h,
                    };
                  }
                  return c;
                })
              );
            }
          }
        } catch {}
      };
    } catch {}

    // Fallback periodic price fetch
    const fetchFallback = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && mounted) {
            const map: Record<string, { price: number; change: number; vol: string }> = {};
            data.forEach((item: any) => {
              if (item.symbol) {
                const qVol = parseFloat(item.quoteVolume || '0');
                const volStr = qVol >= 1e9 ? (qVol / 1e9).toFixed(2) + 'B' : qVol >= 1e6 ? (qVol / 1e6).toFixed(1) + 'M' : (qVol / 1e3).toFixed(1) + 'K';
                map[item.symbol] = {
                  price: parseFloat(item.lastPrice),
                  change: parseFloat(item.priceChangePercent),
                  vol: volStr,
                };
              }
            });

            setCoins(prev =>
              prev.map(c => {
                const found = map[c.symbol];
                if (found) {
                  return {
                    ...c,
                    price: found.price,
                    change24h: found.change,
                    volume24h: found.vol,
                  };
                }
                return c;
              })
            );
          }
        }
      } catch {}
    };

    fetchFallback();

    return () => {
      mounted = false;
      ws?.close();
    };
  }, []);

  // Filter and sort based on selected tab
  const displayedCoins = [...coins].sort((a, b) => {
    if (tab === 'gainers') {
      return b.change24h - a.change24h;
    }
    if (tab === 'volume') {
      // Parse volume roughly
      const parseVol = (v: string) => {
        const num = parseFloat(v);
        if (v.includes('B')) return num * 1000;
        if (v.includes('M')) return num;
        return num / 1000;
      };
      return parseVol(b.volume24h) - parseVol(a.volume24h);
    }
    return 0; // hot maintains default order
  });

  const formatPrice = (p: number) => {
    if (p < 0.0001) return p.toFixed(8);
    if (p < 0.01) return p.toFixed(6);
    if (p < 1) return p.toFixed(4);
    if (p < 100) return p.toFixed(2);
    return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-3 pt-1">
      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
        <div className="flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setTab('hot')}
            className={`flex items-center gap-1 transition-colors relative pb-1 ${
              tab === 'hot' ? 'text-white' : 'text-text-muted hover:text-white/80'
            }`}
          >
            <Flame size={14} className={tab === 'hot' ? 'text-brand-primary' : ''} />
            Hot
            {tab === 'hot' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
            )}
          </button>

          <button
            onClick={() => setTab('gainers')}
            className={`flex items-center gap-1 transition-colors relative pb-1 ${
              tab === 'gainers' ? 'text-white' : 'text-text-muted hover:text-white/80'
            }`}
          >
            <TrendingUp size={14} className={tab === 'gainers' ? 'text-green-400' : ''} />
            Gainers
            {tab === 'gainers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setTab('volume')}
            className={`flex items-center gap-1 transition-colors relative pb-1 ${
              tab === 'volume' ? 'text-white' : 'text-text-muted hover:text-white/80'
            }`}
          >
            <BarChart3 size={14} className={tab === 'volume' ? 'text-brand-gold' : ''} />
            24h Vol
            {tab === 'volume' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
            )}
          </button>
        </div>

        <button
          onClick={() => navigate('/trade')}
          className="text-[11px] text-text-muted hover:text-brand-primary flex items-center gap-0.5 transition-colors font-medium"
        >
          All Markets <ChevronRight size={13} />
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-text-muted px-2 tracking-wider">
        <div className="col-span-5">Name / Vol</div>
        <div className="col-span-4 text-right">Last Price</div>
        <div className="col-span-3 text-right">24h Chg%</div>
      </div>

      {/* Coins List */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl border border-[var(--color-border-card)] divide-y divide-white/5 overflow-hidden shadow-xl">
        {displayedCoins.map((coin) => {
          const isPositive = coin.change24h >= 0;

          return (
            <motion.div
              key={coin.symbol}
              onClick={() => navigate('/trade')}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              className="grid grid-cols-12 items-center p-3 sm:p-3.5 cursor-pointer transition-colors"
            >
              {/* Coin Info */}
              <div className="col-span-5 flex items-center gap-2.5 min-w-0 pr-1">
                <div className={`w-8 h-8 rounded-full ${coin.color} flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0`}>
                  {coin.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-white truncate">{coin.base}</span>
                    <span className="text-[10px] text-text-muted">/{coin.quote}</span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate mt-0.5">
                    Vol {coin.volume24h}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-4 text-right pr-2">
                <div className="font-mono font-bold text-xs sm:text-sm text-white drop-shadow">
                  ${formatPrice(coin.price)}
                </div>
                <div className="text-[9px] text-text-muted mt-0.5">
                  ≈ {formatPrice(coin.price)} USDT
                </div>
              </div>

              {/* 24h Change Pill Badge */}
              <div className="col-span-3 flex justify-end">
                <div
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono text-center min-w-[62px] flex items-center justify-center gap-0.5 shadow-sm transition-all ${
                    isPositive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span>{isPositive ? `+${coin.change24h.toFixed(2)}%` : `${coin.change24h.toFixed(2)}%`}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
