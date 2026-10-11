import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { formatXRP } from '../lib/utils';
import { store } from '../lib/store';
import { useTranslation } from '../contexts/TranslationContext';
import {
  User,
  Shield,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Crown,
  Users,
  Headset,
  FileText,
  LogOut,
  ChevronRight,
  ExternalLink,
  Lock,
  Globe,
  Clock,
  ScanFace,
  CheckCircle2,
  X,
} from 'lucide-react';
import novaxLogo from '../assets/images/novax_logo_1782982838843.jpg';
import SecurityCenterModal from '../components/SecurityCenterModal';
import KycModal from '../components/KycModal';
import LanguageModal from '../components/LanguageModal';

function TransactionHistoryModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const transactions = (store.getState().transactions || [])
    .filter((t) => t.userId === user?.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-[#0b1526] rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Clock size={18} className="text-[#00ffff]" />
            <h3 className="text-base font-bold">{t('Financial Records')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 rounded-full text-text-muted hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-muted">
              {t('No financial records found')}
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#050b14] border border-white/10 p-3.5 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white capitalize flex items-center gap-1.5">
                    <span className="text-brand-gold">{tx.type}</span>
                    <span className="text-[10px] text-text-muted">({tx.currency || 'XRP'})</span>
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                  {tx.description && (
                    <div className="text-[10px] text-text-muted mt-0.5 max-w-[200px] truncate">
                      {tx.description}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold text-sm ${
                    tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.amount >= 0 ? `+${formatXRP(tx.amount)}` : `-${formatXRP(Math.abs(tx.amount))}`}
                  </div>
                  <span
                    className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      tx.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : tx.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-rose-400'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { language, t } = useTranslation();

  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [securityTab, setSecurityTab] = useState<'faceId' | 'withdrawPin' | 'password' | '2fa'>('faceId');
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isOwner = user?.role === 'admin' || user?.email?.toLowerCase() === 'mdbiplobiislam739@gmail.com';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getLanguageLabel = () => {
    if (language === 'Bengali') return 'বাংলা';
    if (language === 'Hindi') return 'हिन्दी';
    return 'English';
  };

  return (
    <div className="space-y-4 pt-2 pb-10">
      {/* User Header Card */}
      <div className="glass-panel p-5 rounded-3xl bg-gradient-to-br from-brand-primary/10 via-[var(--color-bg-card)] to-brand-gold/10 border border-brand-primary/30 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={novaxLogo}
              alt="Avatar"
              onError={(e) => { e.currentTarget.src = '/novax_logo.jpg'; }}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-primary/50 shadow-md"
            />
            {isOwner && (
              <span className="absolute -bottom-1 -right-1 text-xs" title="Owner">
                👑
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white truncate">{user?.username || 'User'}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                VIP {user?.vipLevel || 0}
              </span>
            </div>
            <div className="text-[11px] text-text-muted truncate mt-0.5">{user?.email}</div>
            {isOwner && (
              <div className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-brand-primary/20 text-brand-primary border border-brand-primary/40 rounded-full font-bold">
                Platform Owner
              </div>
            )}
          </div>
        </div>

        {/* Balance Section */}
        <div className="mt-5 p-3.5 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-muted font-bold uppercase">Current Balance</div>
            <div className="text-xl font-black text-brand-gold drop-shadow mt-0.5">
              {formatXRP(user?.balance || 0)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-text-muted font-bold uppercase">Total Earned</div>
            <div className="text-sm font-bold text-green-400 mt-0.5">
              +{formatXRP(user?.totalEarnings || 0)}
            </div>
          </div>
        </div>

        {/* Quick Finance Actions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Link
            to="/finance/recharge"
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-gold text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <ArrowDownLeft size={16} /> Recharge
          </Link>
          <Link
            to="/finance/withdraw"
            className="py-2.5 px-3 rounded-xl bg-white/10 text-white hover:bg-white/15 border border-white/15 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <ArrowUpRight size={16} /> Withdraw
          </Link>
        </div>
      </div>

      {/* Admin Panel Entry if Owner */}
      {isOwner && (
        <Link
          to="/admin"
          className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-brand-primary/20 to-brand-gold/20 border border-brand-primary/40 shadow-lg group hover:border-brand-primary transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/30 flex items-center justify-center text-brand-primary">
              <Shield size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                Owner Admin Dashboard
                <span className="text-[9px] bg-brand-primary text-black font-black px-1.5 py-0.5 rounded">
                  SECURE
                </span>
              </div>
              <div className="text-[10px] text-text-muted">Manage deposits, users, withdraws & rates</div>
            </div>
          </div>
          <ChevronRight size={18} className="text-brand-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Main Settings Menu Items (Matching Screenshots 1, 2, 3) */}
      <div className="glass-panel rounded-3xl border border-[var(--color-border-card)] divide-y divide-white/5 overflow-hidden shadow-xl">
        {/* 1. Security Settings */}
        <button
          onClick={() => {
            setSecurityTab('faceId');
            setIsSecurityOpen(true);
          }}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00ffff]/10 border border-[#00ffff]/30 flex items-center justify-center text-[#00ffff] group-hover:scale-105 transition-transform">
              <Shield size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">{t('Security Settings')}</div>
              <div className="text-[11px] text-text-muted mt-0.5 font-mono">
                PIN: {user?.withdrawPin ? 'Active' : 'Active'} • 2FA: {user?.twoFactorEnabled ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 2. KYC Verification */}
        <button
          onClick={() => setIsKycOpen(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00ffff]/10 border border-[#00ffff]/30 flex items-center justify-center text-[#00ffff] group-hover:scale-105 transition-transform">
              <User size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                {t('KYC Verification')}
                <span className="text-emerald-400 font-bold">✓</span>
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {user?.kycStatus === 'verified'
                  ? t('Verified Account')
                  : user?.kycStatus === 'pending'
                  ? t('Verification Under Review')
                  : t('Submit ID & Selfie')}
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 3. Withdraw Security */}
        <button
          onClick={() => {
            setSecurityTab('withdrawPin');
            setIsSecurityOpen(true);
          }}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold group-hover:scale-105 transition-transform">
              <Lock size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">{t('Withdraw Security')}</div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {t('Configure 4-6 digit secret PIN')}
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 4. Financial Records */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00ffff]/10 border border-[#00ffff]/30 flex items-center justify-center text-[#00ffff] group-hover:scale-105 transition-transform">
              <Clock size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">{t('Financial Records')}</div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {t('Deposit, withdraw & commission history')}
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 5. Language */}
        <button
          onClick={() => setIsLanguageOpen(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00ffff]/10 border border-[#00ffff]/30 flex items-center justify-center text-[#00ffff] group-hover:scale-105 transition-transform">
              <Globe size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">{t('Language')}</div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {t('Select your preferred language')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-[#00ffff]/10 border border-[#00ffff]/30 text-[#00ffff] font-bold text-xs">
              {getLanguageLabel()}
            </span>
            <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Additional Quick Privileges */}
      <div className="glass-panel rounded-2xl border border-[var(--color-border-card)] divide-y divide-white/5 overflow-hidden">
        <Link
          to="/vip"
          className="p-3.5 flex items-center justify-between text-xs hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Crown size={16} className="text-brand-gold" />
            <span className="text-white font-medium">{t('VIP Level Privileges')}</span>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </Link>

        <Link
          to="/team"
          className="p-3.5 flex items-center justify-between text-xs hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users size={16} className="text-brand-primary" />
            <span className="text-white font-medium">{t('My Team & Referrals')}</span>
          </div>
          <ChevronRight size={16} className="text-text-muted" />
        </Link>

        <a
          href="https://t.me/TRXHubSupport"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 flex items-center justify-between text-xs hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Headset size={16} className="text-emerald-400" />
            <span className="text-white font-medium">{t('Official 24/7 Support')}</span>
          </div>
          <ExternalLink size={14} className="text-text-muted" />
        </a>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut size={16} /> {t('Sign Out')}
      </button>

      {/* Security Center Modal (Photo 1) */}
      <SecurityCenterModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        defaultTab={securityTab}
      />

      {/* KYC Modal (Photo 2) */}
      <KycModal
        isOpen={isKycOpen}
        onClose={() => setIsKycOpen(false)}
      />

      {/* Language Modal (Photo 3) */}
      <LanguageModal
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
      />

      {/* Transaction History Modal */}
      {isHistoryOpen && (
        <TransactionHistoryModal onClose={() => setIsHistoryOpen(false)} />
      )}
    </div>
  );
}
