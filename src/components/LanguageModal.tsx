import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, setLanguage } = useTranslation();

  if (!isOpen) return null;

  const languages = [
    {
      id: 'Bengali' as const,
      name: 'বাংলা (Bengali)',
      region: 'বাংলাদেশ / পশ্চিমবঙ্গ',
      flag: '🇧🇩',
    },
    {
      id: 'Hindi' as const,
      name: 'हिन्दी (Hindi)',
      region: 'भारत (India) / Global',
      flag: '🇮🇳',
    },
    {
      id: 'English' as const,
      name: 'English',
      region: 'United States / Global',
      flag: '🇺🇸',
    },
  ];

  const handleSelect = (langId: 'Bengali' | 'Hindi' | 'English') => {
    setLanguage(langId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-[#0b1526] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white">
              {language === 'Bengali' ? 'ভাষা নির্বাচন করুন' : language === 'Hindi' ? 'भाषा चुनें' : 'Select Language'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Languages List */}
          <div className="space-y-2.5">
            {languages.map((item) => {
              const isSelected = language === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#00ffff]/10 border-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.15)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl">{item.flag}</span>
                    <div>
                      <div className="font-bold text-sm text-white">{item.name}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{item.region}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#00ffff] text-black flex items-center justify-center">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
