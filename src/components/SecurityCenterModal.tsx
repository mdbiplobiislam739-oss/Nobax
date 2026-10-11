import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { store } from '../lib/store';
import { Shield, X, ScanFace, Lock, KeyRound, Smartphone, CheckCircle2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'faceId' | 'withdrawPin' | 'password' | '2fa';
}

export default function SecurityCenterModal({
  isOpen,
  onClose,
  defaultTab = 'faceId',
}: SecurityCenterModalProps) {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'withdrawPin' | 'password' | '2fa' | 'faceId'>(defaultTab);

  // States
  const [pin, setPin] = useState(user?.withdrawPin || '');
  const [confirmPin, setConfirmPin] = useState(user?.withdrawPin || '');
  const [isFaceEnabled, setIsFaceEnabled] = useState(user?.faceIdEnabled ?? false);
  const [is2faEnabled, setIs2faEnabled] = useState(user?.twoFactorEnabled ?? false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleToggleFaceId = async () => {
    if (!user) return;
    setIsSaving(true);
    setMsg(null);
    try {
      const newState = !isFaceEnabled;
      await store.updateUser(user.id, {
        faceIdEnabled: newState,
        faceIdData: newState ? `biometric_hash_${Date.now()}` : '',
      });
      setIsFaceEnabled(newState);
      await refreshUser();
      setMsg({
        text: newState ? t('Face ID enabled successfully') : t('Face ID disabled'),
        type: 'success',
      });
    } catch (err: any) {
      setMsg({ text: err.message || 'Error updating Face ID', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (pin.length < 4 || pin.length > 6) {
      setMsg({ text: t('PIN must be 4 to 6 digits'), type: 'error' });
      return;
    }
    if (pin !== confirmPin) {
      setMsg({ text: t('PINs do not match'), type: 'error' });
      return;
    }

    setIsSaving(true);
    setMsg(null);
    try {
      await store.updateUser(user.id, { withdrawPin: pin });
      await refreshUser();
      setMsg({ text: t('PIN saved successfully'), type: 'success' });
    } catch (err: any) {
      setMsg({ text: err.message || 'Error saving PIN', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle2fa = async () => {
    if (!user) return;
    setIsSaving(true);
    setMsg(null);
    try {
      const newState = !is2faEnabled;
      await store.updateUser(user.id, { twoFactorEnabled: newState });
      setIs2faEnabled(newState);
      await refreshUser();
      setMsg({
        text: newState ? t('2FA enabled successfully') : t('2FA disabled'),
        type: 'success',
      });
    } catch (err: any) {
      setMsg({ text: err.message || 'Error updating 2FA', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#0b1526] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00ffff]/15 border border-[#00ffff]/30 flex items-center justify-center text-[#00ffff]">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{t('Security Center')}</h3>
                <p className="text-[11px] text-text-muted">{t('PIN, Password & Face ID')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="grid grid-cols-4 bg-[#050b14] p-1 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTab('withdrawPin')}
              className={`py-2 px-1 rounded-xl transition-all truncate text-center ${
                tab === 'withdrawPin' ? 'bg-[#00ffff] text-black shadow-md' : 'text-text-muted hover:text-white'
              }`}
            >
              {t('Withdraw PIN')}
            </button>
            <button
              type="button"
              onClick={() => setTab('password')}
              className={`py-2 px-1 rounded-xl transition-all truncate text-center ${
                tab === 'password' ? 'bg-[#00ffff] text-black shadow-md' : 'text-text-muted hover:text-white'
              }`}
            >
              {t('Password')}
            </button>
            <button
              type="button"
              onClick={() => setTab('2fa')}
              className={`py-2 px-1 rounded-xl transition-all truncate text-center ${
                tab === '2fa' ? 'bg-[#00ffff] text-black shadow-md' : 'text-text-muted hover:text-white'
              }`}
            >
              2FA
            </button>
            <button
              type="button"
              onClick={() => setTab('faceId')}
              className={`py-2 px-1 rounded-xl transition-all truncate text-center ${
                tab === 'faceId' ? 'bg-[#00ffff] text-black shadow-md' : 'text-text-muted hover:text-white'
              }`}
            >
              Face ID
            </button>
          </div>

          {msg && (
            <div
              className={`p-3 rounded-2xl text-xs text-center border ${
                msg.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/15 border-red-500/30 text-rose-400'
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* TAB 1: Face ID View */}
          {tab === 'faceId' && (
            <div className="space-y-4 text-center pt-2">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#00ffff]/10 border-2 border-[#00ffff] flex items-center justify-center text-[#00ffff] shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                <ScanFace size={50} className="stroke-[1.5]" />
              </div>

              <div>
                <h4 className="font-bold text-base text-white">{t('Face ID & Biometric Security')}</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed px-4">
                  {t('Use Face ID for faster login and withdrawals')}
                </p>
              </div>

              {/* Status Card */}
              <div className="p-3.5 bg-[#050b14] border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{t('Biometric Status')}</span>
                <span className={`font-mono font-bold uppercase text-[11px] ${
                  isFaceEnabled ? 'text-emerald-400' : 'text-text-muted'
                }`}>
                  {isFaceEnabled ? 'Active  •  ENABLED' : 'Inactive  •  DISABLED'}
                </span>
              </div>

              {/* Cyan Button */}
              <button
                type="button"
                onClick={handleToggleFaceId}
                disabled={isSaving}
                className="w-full py-3.5 bg-[#00ffff] hover:bg-[#00ffff]/90 text-black font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.4)] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? t('Saving...') : isFaceEnabled ? t('Disable Face ID') : t('Enable Face ID')}
              </button>

              {/* Session Card at Bottom */}
              <div className="p-3 bg-[#050b14] border border-white/5 rounded-2xl text-[11px] text-text-muted text-left space-y-1">
                <div className="flex justify-between">
                  <span>{t('Device Session:')}</span>
                  <span className="text-white font-mono">{user?.ipAddress || '103.205.182.42'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('Last Login:')}</span>
                  <span className="text-white">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Withdraw PIN */}
          {tab === 'withdrawPin' && (
            <form onSubmit={handleSavePin} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-semibold text-text-muted mb-1 block">{t('New Withdraw PIN')}</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-[#050b14] border border-white/20 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#00ffff] font-mono tracking-widest text-center"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted mb-1 block">{t('Confirm PIN')}</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="******"
                  className="w-full bg-[#050b14] border border-white/20 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#00ffff] font-mono tracking-widest text-center"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-[#00ffff] text-black font-black text-sm rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all mt-2"
              >
                {isSaving ? t('Saving...') : t('Save PIN')}
              </button>
            </form>
          )}

          {/* TAB 3: Password */}
          {tab === 'password' && (
            <div className="space-y-3.5 pt-2 text-xs">
              <p className="text-text-muted leading-relaxed">
                {t('Reset password email will be sent to your registered email')} ({user?.email}).
              </p>
              <button
                type="button"
                onClick={() => {
                  setMsg({ text: t('Password reset email sent'), type: 'success' });
                }}
                className="w-full py-3.5 bg-[#00ffff] text-black font-black text-sm rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                {t('Send Password Reset Email')}
              </button>
            </div>
          )}

          {/* TAB 4: 2FA */}
          {tab === '2fa' && (
            <div className="space-y-4 pt-2 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00ffff]/10 border border-[#00ffff]/30 flex items-center justify-center text-[#00ffff]">
                <Smartphone size={32} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{t('Two-Factor Authentication (2FA)')}</h4>
                <p className="text-xs text-text-muted mt-1">
                  {t('Add extra security layer')}
                </p>
              </div>

              <div className="p-3 bg-[#050b14] border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-white font-medium">{t('2FA Status')}</span>
                <span className={`font-mono font-bold uppercase ${is2faEnabled ? 'text-emerald-400' : 'text-text-muted'}`}>
                  {is2faEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggle2fa}
                disabled={isSaving}
                className="w-full py-3.5 bg-[#00ffff] text-black font-black text-sm rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                {isSaving ? t('Saving...') : is2faEnabled ? t('Disable 2FA') : t('Enable 2FA')}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
