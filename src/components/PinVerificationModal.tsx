import React, { useState } from 'react';
import { Lock, X, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { Member, MenuItem } from '../types';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  menuItem: MenuItem;
  supportWhatsApp: string;
  onConfirmPin: (enteredPin: string) => Promise<boolean> | boolean;
}

export const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  isOpen,
  onClose,
  member,
  menuItem,
  supportWhatsApp,
  onConfirmPin
}) => {
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsVerifying(true);
    setHasError(false);

    try {
      const isValid = await onConfirmPin(pin.trim());
      if (!isValid) {
        setHasError(true);
        setErrorMessage('Incorrect PIN! Please contact the manager.');
      }
    } catch {
      setHasError(true);
      setErrorMessage('Verification failed. Please contact manager.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWhatsAppHelp = () => {
    const rawNumber = supportWhatsApp.replace(/[^0-9]/g, '');
    const intlNumber = rawNumber.startsWith('88') ? rawNumber : `88${rawNumber}`;
    const text = encodeURIComponent(
      `Hello, I am ${member.name} (Room: ${member.room}). I need assistance with my meal order PIN.`
    );
    window.open(`https://wa.me/${intlNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">PIN Verification</h3>
              <p className="text-xs text-emerald-100">Enter your PIN to confirm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Order Details Brief */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Member:</span>
              <span className="font-bold text-slate-900">
                {member.name} (Room {member.room})
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Menu Item:</span>
              <span className="font-bold text-emerald-800">{menuItem.name}</span>
            </div>
            <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1 mt-1">
              <span>Price:</span>
              <span className="font-extrabold text-slate-900">
                {menuItem.price} BDT
              </span>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left">
                Security PIN:
              </label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (hasError) setHasError(false);
                  }}
                  placeholder="Enter 4-digit PIN"
                  className={`w-full py-3 px-4 text-center tracking-widest text-2xl font-bold rounded-xl border-2 transition-all bg-slate-50 focus:bg-white focus:outline-hidden ${
                    hasError
                      ? 'border-red-500 focus:border-red-600 text-red-900 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-slate-900'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Error Message with WhatsApp Help Button */}
            {hasError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-left animate-in shake duration-300">
                <div className="flex items-start gap-2 text-red-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppHelp}
                  className="w-full py-2.5 px-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-green-600" />
                  <span>Contact Manager ({supportWhatsApp})</span>
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isVerifying || !pin}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-sm cursor-pointer"
              >
                {isVerifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Order</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
