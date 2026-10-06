import React, { useState, useEffect } from 'react';
import {
  Moon,
  Clock,
  Calendar,
  Settings as SettingsIcon,
  ShieldCheck,
  Building2,
  LogOut
} from 'lucide-react';
import { Settings } from '../types';
import { isWithinOrderWindow } from '../storage';

interface HeaderProps {
  settings: Settings;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  onOpenAdminPinPrompt: () => void;
  onOpenAdminPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isAdmin,
  onLogoutAdmin,
  onOpenAdminPinPrompt,
  onOpenAdminPanel
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const windowStatus = isWithinOrderWindow(settings, currentTime);

  const englishDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <header className="w-full bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-xl rounded-3xl p-4 sm:p-5 mb-5 border border-emerald-600/40 relative overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-emerald-600/40">
        <div className="flex items-center gap-1.5 text-xs text-emerald-200">
          <Building2 className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-semibold">{settings.messName || 'Hostel Mess'}</span>
        </div>

        {/* Settings Icon / Active Manager Badge */}
        <div className="flex items-center gap-1.5">
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                title="Open Manager Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                <span>Manager</span>
              </button>
              <button
                onClick={onLogoutAdmin}
                className="p-1.5 bg-emerald-900/80 hover:bg-red-800 text-emerald-200 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminPinPrompt}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-emerald-900/60 hover:bg-emerald-800/90 text-emerald-200 hover:text-white rounded-xl text-xs font-bold border border-emerald-600/50 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Manager Settings"
            >
              <SettingsIcon className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Branding and Status Badges */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-tr from-amber-400 to-amber-200 text-emerald-950 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/30 shrink-0">
            <Moon className="w-6 h-6 fill-emerald-950" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
              Sehri Meal Order
            </h1>
            <p className="text-xs text-emerald-100 font-medium">
              Daily meal booking & orders management
            </p>
          </div>
        </div>

        {/* Date, Time & Order Status */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-600/40 font-medium text-emerald-100">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>{englishDate}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-600/40 font-bold text-amber-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>{formattedTime}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold border ${
              windowStatus.isOpen
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                : 'bg-amber-500/20 text-amber-200 border-amber-400/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                windowStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{windowStatus.isOpen ? 'Orders Open' : 'Orders Closed'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
