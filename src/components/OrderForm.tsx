import React, { useState } from 'react';
import {
  Utensils,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  ChevronDown,
  Lock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Member, MenuItem, Order, Settings } from '../types';
import { formatMemberLabel, maskPhoneNumber, isWithinOrderWindow } from '../storage';
import { PinVerificationModal } from './PinVerificationModal';

interface OrderFormProps {
  members: Member[];
  menu: MenuItem[];
  orders: Order[];
  settings: Settings;
  isAdmin: boolean;
  onConfirmOrderWithPin: (
    memberId: string,
    menuId: string,
    enteredPin: string
  ) => Promise<{
    status: 'success' | 'invalid_pin' | 'insufficient_balance' | 'already_ordered' | 'time_restricted' | 'error';
    message?: string;
  }>;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  members,
  menu,
  orders,
  settings,
  isAdmin,
  onConfirmOrderWithPin
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  const [buttonState, setButtonState] = useState<{
    text: string;
    type: 'default' | 'processing' | 'success' | 'insufficient' | 'already' | 'restricted' | 'warning';
  }>({
    text: 'Place Order',
    type: 'default'
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    subtitle?: string;
  } | null>(null);

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const selectedMenuItem = menu.find((item) => item.id === selectedMenuId);

  // Check if member already ordered
  const memberHasOrdered = selectedMember
    ? orders.some((o) => o.memberId === selectedMember.id || o.name === selectedMember.name)
    : false;

  const handleInitiateOrder = () => {
    if (!selectedMemberId || !selectedMenuId) {
      setButtonState({
        text: 'Please select member & menu!',
        type: 'warning'
      });
      setNotification({
        type: 'warning',
        message: 'Missing selection',
        subtitle: 'Please select your name and today’s food menu first.'
      });

      setTimeout(() => {
        setButtonState({ text: 'Place Order', type: 'default' });
        setNotification(null);
      }, 2500);
      return;
    }

    // Check time restriction
    if (!isAdmin && settings.timeRestrictionEnabled) {
      const windowStatus = isWithinOrderWindow(settings);
      if (!windowStatus.isOpen) {
        setButtonState({
          text: 'Order Time: 4:30 PM - 7:01 PM',
          type: 'restricted'
        });
        setNotification({
          type: 'error',
          message: 'Order window closed',
          subtitle: 'Orders are accepted daily between 4:30 PM and 7:01 PM.'
        });
        setTimeout(() => {
          setButtonState({ text: 'Place Order', type: 'default' });
        }, 5000);
        return;
      }
    }

    // Check already ordered
    if (memberHasOrdered) {
      setButtonState({
        text: 'Already Ordered Today!',
        type: 'already'
      });
      setNotification({
        type: 'warning',
        message: 'Already ordered',
        subtitle: `${selectedMember?.name} has already placed an order for today.`
      });
      setTimeout(() => {
        setButtonState({ text: 'Place Order', type: 'default' });
      }, 3500);
      return;
    }

    // Check balance
    if (selectedMember && selectedMenuItem && selectedMember.balance < selectedMenuItem.price) {
      setButtonState({
        text: 'Insufficient Balance!',
        type: 'insufficient'
      });
      setNotification({
        type: 'error',
        message: 'Insufficient balance',
        subtitle: `Current balance: ${selectedMember.balance} BDT. Required: ${selectedMenuItem.price} BDT.`
      });
      setTimeout(() => {
        setButtonState({ text: 'Place Order', type: 'default' });
      }, 5000);
      return;
    }

    // Prompt for PIN
    setIsPinModalOpen(true);
  };

  const handleVerifyPinAndPlaceOrder = async (enteredPin: string): Promise<boolean> => {
    if (!selectedMember || !selectedMenuItem) return false;

    const result = await onConfirmOrderWithPin(selectedMember.id, selectedMenuItem.id, enteredPin);

    if (result.status === 'success') {
      setIsPinModalOpen(false);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setButtonState({
        text: 'Order Placed Successfully!',
        type: 'success'
      });
      setNotification({
        type: 'success',
        message: 'Order confirmed',
        subtitle: `"${selectedMenuItem.name}" listed for ${selectedMember.name}.`
      });

      setTimeout(() => {
        setButtonState({ text: 'Place Order', type: 'default' });
        setNotification(null);
      }, 4000);

      return true;
    }

    if (result.status === 'invalid_pin') {
      return false;
    }

    setIsPinModalOpen(false);
    if (result.status === 'insufficient_balance') {
      setButtonState({
        text: 'Insufficient Balance!',
        type: 'insufficient'
      });
    }
    return false;
  };

  const filteredMembers = members.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.room.toLowerCase().includes(term) ||
      m.phone.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-600/30 overflow-hidden relative transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-5 sm:p-6 text-white text-center">
        <h2 className="text-xl sm:text-2xl font-black tracking-wide">
          Place Meal Order
        </h2>
        <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
          Select your name and food menu to place order.
        </p>

        {settings.timeRestrictionEnabled && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 border border-amber-300/40 text-[11px] font-semibold px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Order Hours: 4:30 PM - 7:01 PM</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-left transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">{notification.message}</div>
              {notification.subtitle && (
                <div className="text-xs mt-0.5 font-medium opacity-90">
                  {notification.subtitle}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1. Select Member */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label
              htmlFor="name"
              className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Select Member:</span>
            </label>
            {selectedMember && (
              <span className="text-[11px] text-emerald-700 font-bold">
                Balance: {selectedMember.balance} BDT
              </span>
            )}
          </div>

          <div className="relative">
            <select
              id="name"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 font-medium text-sm sm:text-base focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Choose Member --</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {formatMemberLabel(member, true)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* Quick Search */}
          {members.length > 4 && (
            <div className="relative mt-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search member by name or room..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
              {searchTerm && filteredMembers.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                  {filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMemberId(m.id);
                        setSearchTerm('');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 border-b border-slate-100 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800">
                        {m.name} (Room {m.room}) [{maskPhoneNumber(m.phone)}]
                      </span>
                      <span className="text-emerald-700 font-bold">{m.balance} BDT</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User card feedback */}
          {selectedMember && (
            <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">{selectedMember.name}</span>
                <span className="text-slate-500 ml-1.5">
                  (Room: {selectedMember.room}, {maskPhoneNumber(selectedMember.phone)})
                </span>
              </div>
              <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
                Balance: {selectedMember.balance} BDT
              </span>
            </div>
          )}
        </div>

        {/* 2. Select Food Menu */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="menu"
            className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5"
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>Select Food Menu:</span>
          </label>

          <div className="relative">
            <select
              id="menu"
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 font-medium text-sm sm:text-base focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Choose Menu Item --</option>
              {menu
                .filter((item) => item.isAvailable)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.price} BDT
                  </option>
                ))}
            </select>
            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {selectedMenuItem && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">{selectedMenuItem.name}</span>
                {selectedMenuItem.description && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selectedMenuItem.description}
                  </div>
                )}
              </div>
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                {selectedMenuItem.price} BDT
              </span>
            </div>
          )}
        </div>

        {/* Primary Order Action Button: Place Order */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleInitiateOrder}
            disabled={buttonState.type === 'processing'}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer ${
              buttonState.type === 'processing'
                ? 'bg-slate-400 text-white cursor-wait'
                : buttonState.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                : buttonState.type === 'insufficient'
                ? 'bg-red-600 text-white shadow-red-600/30'
                : buttonState.type === 'already'
                ? 'bg-amber-600 text-white shadow-amber-600/30'
                : buttonState.type === 'restricted'
                ? 'bg-slate-800 text-white shadow-slate-800/30'
                : buttonState.type === 'warning'
                ? 'bg-amber-500 text-white shadow-amber-500/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/30 hover:shadow-emerald-700/40'
            }`}
          >
            <Lock className="w-5 h-5 text-amber-300" />
            <span>{buttonState.text}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {selectedMember && selectedMenuItem && (
        <PinVerificationModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          member={selectedMember}
          menuItem={selectedMenuItem}
          supportWhatsApp={settings.supportWhatsApp || '01316831199'}
          onConfirmPin={handleVerifyPinAndPlaceOrder}
        />
      )}
    </div>
  );
};
