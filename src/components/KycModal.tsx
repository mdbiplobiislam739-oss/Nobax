import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../lib/store';
import { Shield, X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KycModal({ isOpen, onClose }: KycModalProps) {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.kycData?.fullName || user?.username || '');
  const [idType, setIdType] = useState(user?.kycData?.idType || 'National ID (NID)');
  const [idNumber, setIdNumber] = useState(user?.kycData?.idNumber || '');
  const [frontPhotoName, setFrontPhotoName] = useState(user?.kycData?.frontPhoto ? 'front_id.jpg' : '');
  const [backPhotoName, setBackPhotoName] = useState(user?.kycData?.backPhoto ? 'back_id.jpg' : '');
  const [selfiePhotoName, setSelfiePhotoName] = useState(user?.kycData?.selfiePhoto ? 'selfie_id.jpg' : '');

  const [frontPhoto, setFrontPhoto] = useState<string>(user?.kycData?.frontPhoto || '');
  const [backPhoto, setBackPhoto] = useState<string>(user?.kycData?.backPhoto || '');
  const [selfiePhoto, setSelfiePhoto] = useState<string>(user?.kycData?.selfiePhoto || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'front') setFrontPhotoName(file.name);
    if (type === 'back') setBackPhotoName(file.name);
    if (type === 'selfie') setSelfiePhotoName(file.name);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (type === 'front') setFrontPhoto(base64);
      if (type === 'back') setBackPhoto(base64);
      if (type === 'selfie') setSelfiePhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      setMsg({ text: 'Please enter your Full Legal Name', type: 'error' });
      return;
    }

    if (!idNumber.trim()) {
      setMsg({ text: 'Please enter your ID Number', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMsg(null);
    try {
      await store.updateUser(user.id, {
        kycStatus: 'pending',
        kycData: {
          fullName: fullName.trim(),
          idType,
          idNumber: idNumber.trim(),
          frontPhoto: frontPhoto || 'uploaded_front_id',
          backPhoto: backPhoto || 'uploaded_back_id',
          selfiePhoto: selfiePhoto || 'uploaded_selfie_id',
          submittedAt: Date.now(),
        },
      });

      await refreshUser();
      setMsg({
        text: 'KYC documents submitted successfully! Verification takes 10-30 minutes.',
        type: 'success',
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setMsg({ text: err.message || 'Submission failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
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
            <div className="flex items-center gap-2 text-white">
              <Shield size={20} className="text-[#00ffff]" />
              <h3 className="font-bold text-base">Identity Verification (KYC)</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              <X size={18} />
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Legal Name */}
            <div>
              <label className="text-xs font-semibold text-text-muted mb-1 block">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Biplob Hossen"
                className="w-full bg-[#050b14] border border-white/20 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#00ffff] transition-colors"
              />
            </div>

            {/* ID Type & ID Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-text-muted mb-1 block">ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full bg-[#050b14] border border-white/20 rounded-2xl py-3 px-3 text-xs text-white focus:outline-none focus:border-[#00ffff] transition-colors"
                >
                  <option value="National ID (NID)">National ID (NID)</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted mb-1 block">ID Number</label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="19982691234567890"
                  className="w-full bg-[#050b14] border border-white/20 rounded-2xl py-3 px-3 text-xs text-white focus:outline-none focus:border-[#00ffff] font-mono transition-colors"
                />
              </div>
            </div>

            {/* Document Front Photo */}
            <div>
              <label className="text-xs font-semibold text-text-muted mb-1 block">Document Front Photo</label>
              <label className="w-full bg-[#050b14] border border-white/20 rounded-2xl py-2.5 px-3 flex items-center justify-between cursor-pointer hover:border-[#00ffff]/60 transition-colors">
                <span className="px-3 py-1 bg-[#00ffff] text-black text-xs font-bold rounded-xl">
                  Choose file
                </span>
                <span className="text-xs text-text-muted truncate ml-2">
                  {frontPhotoName || 'No file chosen'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'front')}
                  className="hidden"
                />
              </label>
            </div>

            {/* Document Back Photo */}
            <div>
              <label className="text-xs font-semibold text-text-muted mb-1 block">Document Back Photo</label>
              <label className="w-full bg-[#050b14] border border-white/20 rounded-2xl py-2.5 px-3 flex items-center justify-between cursor-pointer hover:border-[#00ffff]/60 transition-colors">
                <span className="px-3 py-1 bg-[#00ffff] text-black text-xs font-bold rounded-xl">
                  Choose file
                </span>
                <span className="text-xs text-text-muted truncate ml-2">
                  {backPhotoName || 'No file chosen'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'back')}
                  className="hidden"
                />
              </label>
            </div>

            {/* Live Face Selfie with ID */}
            <div>
              <label className="text-xs font-semibold text-text-muted mb-1 block">Live Face Selfie with ID</label>
              <label className="w-full bg-[#050b14] border border-white/20 rounded-2xl py-2.5 px-3 flex items-center justify-between cursor-pointer hover:border-[#00ffff]/60 transition-colors">
                <span className="px-3 py-1 bg-[#00ffff] text-black text-xs font-bold rounded-xl">
                  Choose file
                </span>
                <span className="text-xs text-text-muted truncate ml-2">
                  {selfiePhotoName || 'No file chosen'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'selfie')}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#00ffff] hover:bg-[#00ffff]/90 text-black font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.4)] active:scale-95 transition-all mt-3 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit KYC Documents'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
