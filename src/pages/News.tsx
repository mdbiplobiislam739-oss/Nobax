import React from 'react';
import { Megaphone, ExternalLink, Flame, TrendingUp } from 'lucide-react';

const NEWS_ARTICLES = [
  {
    id: '1',
    title: 'XRP Ledger Global Adoption Surges in 2026',
    category: 'Market Update',
    date: 'Today',
    readTime: '2 min read',
    summary: 'Institutional settlement on the XRP Ledger reached record volumes as cross-border remittance corridors expand across Southeast Asia and the Middle East.',
  },
  {
    id: '2',
    title: 'NovaX VIP 3 Mining Upgrade Bonus Released',
    category: 'Platform Event',
    date: 'Yesterday',
    readTime: '1 min read',
    summary: 'All members upgrading to VIP 3 or above receive an additional bonus on their automated 24-hour cloud hash power cycles.',
  },
  {
    id: '3',
    title: 'Security Advisory: Always Check Official Domain',
    category: 'Security',
    date: '2 days ago',
    readTime: '3 min read',
    summary: 'NovaX will never ask for your secret password or recovery keys. Always verify your secure SSL connection and login credentials.',
  },
  {
    id: '4',
    title: 'Multi-Currency Instant Swap Engine Live',
    category: 'Feature',
    date: '3 days ago',
    readTime: '2 min read',
    summary: 'Users can now seamlessly convert between TRX, USDT, XRP, BTC, and ETH with zero slippage and competitive decentralized rates.',
  },
];

export default function News() {
  return (
    <div className="space-y-4 pt-2 pb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#00FFFF]/20 flex items-center justify-center text-[#00FFFF]">
          <Megaphone size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold text-white">Market News & Signals</h1>
          <p className="text-[11px] text-text-muted">Stay ahead with the latest crypto developments</p>
        </div>
      </div>

      <div className="space-y-3">
        {NEWS_ARTICLES.map((article) => (
          <div
            key={article.id}
            className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)] hover:border-[#00FFFF]/30 transition-all space-y-2"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="px-2 py-0.5 rounded-full bg-[#00FFFF]/10 text-[#00FFFF] font-bold">
                {article.category}
              </span>
              <span className="text-text-muted">{article.date} • {article.readTime}</span>
            </div>

            <h3 className="font-bold text-sm text-white leading-snug">{article.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">{article.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
