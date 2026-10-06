import React, { useState, useEffect, useMemo } from 'react';
import {
  Member,
  MenuItem,
  Order,
  Settings,
  DepositRecord
} from './types';
import {
  loadStoredData,
  saveStoredData,
  resetToDefaults,
  isWithinOrderWindow,
  generateWhatsAppSummary,
  HARDCODED_GOOGLE_SHEET_URL
} from './storage';
import { fetchGoogleSheetData, postOrderToGoogleSheet } from './googleSheetService';
import { Header } from './components/Header';
import { OrderForm } from './components/OrderForm';
import { OrderStats } from './components/OrderStats';
import { AdminDrawer } from './components/AdminDrawer';
import { AdminPinModal } from './components/AdminPinModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { Sparkles, PhoneCall, Heart, ShieldCheck } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(loadStoredData);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState<boolean>(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    saveStoredData({
      members: data.members,
      menu: data.menu,
      orders: data.orders,
      settings: data.settings,
      deposits: data.deposits,
      orderHistory: data.orderHistory
    });
  }, [data]);

  // Automatically fetch fresh data from Google Sheet URL on app startup
  useEffect(() => {
    fetchGoogleSheetData(HARDCODED_GOOGLE_SHEET_URL)
      .then((res) => {
        if (res && res.users && res.menus) {
          setData((prev) => ({
            ...prev,
            members: res.users.length ? res.users : prev.members,
            menu: res.menus.length ? res.menus : prev.menu,
            orders: res.orders && res.orders.length ? res.orders : prev.orders,
            settings: {
              ...prev.settings,
              adminPin: res.settings?.adminPin || prev.settings.adminPin,
              supportWhatsApp: res.settings?.supportWhatsApp || prev.settings.supportWhatsApp,
              messName: res.settings?.messName || prev.settings.messName,
              isGoogleSheetConnected: true
            }
          }));
        }
      })
      .catch((err) => {
        console.warn('Initial Google Sheet sync status:', err);
      });
  }, []);

  // Derived calculations
  const totalPrice = useMemo(() => {
    return data.orders.reduce((sum, ord) => sum + (ord.price || 0), 0);
  }, [data.orders]);

  const menuCount = useMemo(() => {
    const counts: Record<string, number> = {};
    data.orders.forEach((ord) => {
      counts[ord.menuName] = (counts[ord.menuName] || 0) + 1;
    });
    return counts;
  }, [data.orders]);

  // Order Confirmation with PIN Verification
  const handleConfirmOrderWithPin = async (
    memberId: string,
    menuId: string,
    enteredPin: string
  ): Promise<{
    status: 'success' | 'invalid_pin' | 'insufficient_balance' | 'already_ordered' | 'time_restricted' | 'error';
    message?: string;
  }> => {
    const member = data.members.find((m) => m.id === memberId);
    const menuItem = data.menu.find((item) => item.id === menuId);

    if (!member || !menuItem) {
      return { status: 'error', message: 'তথ্য খুঁজে পাওয়া যায়নি' };
    }

    // 1. PIN verification against member's stored PIN (from Google Sheet / Member list)
    const expectedPin = String(member.pin || '').trim();
    if (String(enteredPin).trim() !== expectedPin) {
      return { status: 'invalid_pin', message: 'ভুল পিন' };
    }

    // 2. Time restriction verification
    if (!isAdmin && data.settings.timeRestrictionEnabled) {
      const windowStatus = isWithinOrderWindow(data.settings);
      if (!windowStatus.isOpen) {
        return { status: 'time_restricted', message: 'অর্ডারের সময় শেষ' };
      }
    }

    // 3. Balance verification
    if (member.balance < menuItem.price) {
      return { status: 'insufficient_balance', message: 'অপর্যাপ্ত ব্যালেন্স' };
    }

    // 4. Duplicate check for today
    const alreadyOrdered = data.orders.some(
      (ord) => ord.memberId === member.id || ord.name === member.name
    );
    if (alreadyOrdered) {
      return { status: 'already_ordered', message: 'ইতোমধ্যে অর্ডার করা হয়েছে' };
    }

    // 5. Deduct balance and create new order
    const updatedMembers = data.members.map((m) => {
      if (m.id === member.id) {
        return {
          ...m,
          balance: m.balance - menuItem.price
        };
      }
      return m;
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      memberId: member.id,
      name: member.name,
      room: member.room,
      phone: member.phone,
      displayString: `${member.name}:${member.room} - ${menuItem.name}`,
      menuId: menuItem.id,
      menuName: menuItem.name,
      price: menuItem.price,
      orderedAt: new Date().toISOString()
    };

    const newDepositRecord: DepositRecord = {
      id: `deduct-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      amount: menuItem.price,
      type: 'deduction',
      method: 'Cash',
      giver: 'সেহরির খাবার অর্ডার',
      date: new Date().toISOString().split('T')[0],
      note: menuItem.name
    };

    setData((prev) => ({
      ...prev,
      members: updatedMembers,
      orders: [newOrder, ...prev.orders],
      orderHistory: [newOrder, ...prev.orderHistory],
      deposits: [newDepositRecord, ...prev.deposits]
    }));

    // Post order directly to Google Sheet API
    postOrderToGoogleSheet(
      HARDCODED_GOOGLE_SHEET_URL,
      member.name,
      enteredPin,
      menuItem.name
    ).catch((err) => {
      console.warn('Google Sheet background order recording:', err);
    });

    return { status: 'success' };
  };

  // Admin order cancellation
  const handleCancelOrder = (orderId: string) => {
    const targetOrder = data.orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (
      !confirm(
        `আপনি কি ${targetOrder.name} এর অর্ডার বাতিল এবং ${targetOrder.price} ৳ রিফান্ড করতে চান?`
      )
    ) {
      return;
    }

    const updatedMembers = data.members.map((m) => {
      if (m.id === targetOrder.memberId || m.name === targetOrder.name) {
        return {
          ...m,
          balance: m.balance + targetOrder.price
        };
      }
      return m;
    });

    const updatedOrders = data.orders.filter((o) => o.id !== orderId);

    setData((prev) => ({
      ...prev,
      members: updatedMembers,
      orders: updatedOrders
    }));
  };

  // Menu items CRUD
  const handleAddMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `food-${Date.now()}`
    };
    setData((prev) => ({ ...prev, menu: [...prev.menu, newItem] }));
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setData((prev) => ({
      ...prev,
      menu: prev.menu.map((m) => (m.id === updatedItem.id ? updatedItem : m))
    }));
  };

  const handleDeleteMenuItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      menu: prev.menu.filter((m) => m.id !== id)
    }));
  };

  // Members CRUD
  const handleAddMember = (newMem: Omit<Member, 'id'>) => {
    const member: Member = {
      ...newMem,
      id: `m-${Date.now()}`
    };
    setData((prev) => ({ ...prev, members: [...prev.members, member] }));
  };

  const handleDeleteMember = (id: string) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id)
    }));
  };

  // Reset today's orders
  const handleResetTodayOrders = () => {
    setData((prev) => ({
      ...prev,
      orders: []
    }));
  };

  // Reset to default
  const handleResetAllData = () => {
    resetToDefaults();
  };

  const whatsAppText = useMemo(() => {
    return generateWhatsAppSummary(
      data.orders,
      menuCount,
      totalPrice,
      data.settings.messName
    );
  }, [data.orders, menuCount, totalPrice, data.settings.messName]);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 pb-16 font-sans">
      {/* Top Ramadan Banner */}
      <div className="bg-emerald-950 text-emerald-200 text-xs py-1.5 px-3 text-center font-medium flex items-center justify-center gap-2 border-b border-emerald-900">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Ramadan Mubarak! Daily Sehri & meal order booking system.</span>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
        {/* Header: Manager mode locked by default; corner settings icon opens PIN modal */}
        <Header
          settings={data.settings}
          isAdmin={isAdmin}
          onLogoutAdmin={() => setIsAdmin(false)}
          onOpenAdminPinPrompt={() => setIsAdminPinModalOpen(true)}
          onOpenAdminPanel={() => setIsAdminDrawerOpen(true)}
        />

        {/* Manager Banner if currently logged in */}
        {isAdmin && (
          <div className="mb-4 p-3 bg-amber-500/15 border border-amber-400 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-amber-950 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span className="font-bold">Manager Mode Active:</span>
              <span className="hidden sm:inline">You have full access to manage menu, view full phone numbers & balances.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdminDrawerOpen(true)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs cursor-pointer text-xs"
              >
                Panel
              </button>
              <button
                onClick={() => setIsAdmin(false)}
                className="px-2.5 py-1 bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area: Mobile-First Responsive Layout */}
        <div className="space-y-6">
          {/* Order Placement Form with PIN Protection */}
          <div className="max-w-xl mx-auto w-full">
            <OrderForm
              members={data.members}
              menu={data.menu}
              orders={data.orders}
              settings={data.settings}
              isAdmin={isAdmin}
              onConfirmOrderWithPin={handleConfirmOrderWithPin}
            />
          </div>

          {/* Stats and Order Breakdown Tables */}
          <OrderStats
            orders={data.orders}
            menu={data.menu}
            totalPrice={totalPrice}
            menuCount={menuCount}
            isAdmin={isAdmin}
            onCancelOrder={handleCancelOrder}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            settings={data.settings}
          />
        </div>

        {/* Footer with WhatsApp Support */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-700 font-medium">
            <span>{data.settings.messName || 'Hostel Mess'}</span>
            <span>•</span>
            <a
              href={`https://wa.me/88${data.settings.supportWhatsApp || '01316831199'}?text=${encodeURIComponent(
                'Hello, I need assistance regarding the meal order.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-700 font-bold hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              WhatsApp: {data.settings.supportWhatsApp || '01316831199'}
            </a>
          </div>
          <p className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <span>Mess Meal Ordering System</span>
            <span>•</span>
            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
            <span>Built for Hostels & Messes</span>
          </p>
        </footer>
      </div>

      {/* Admin PIN Prompt Modal */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        adminPin={data.settings.adminPin || '1234'}
        supportWhatsApp={data.settings.supportWhatsApp || '01316831199'}
        onSuccess={() => {
          setIsAdmin(true);
          setIsAdminDrawerOpen(true);
        }}
      />

      {/* Admin Manager Drawer */}
      <AdminDrawer
        isOpen={isAdminDrawerOpen}
        onClose={() => setIsAdminDrawerOpen(false)}
        settings={data.settings}
        onUpdateSettings={(newSet) =>
          setData((prev) => ({ ...prev, settings: newSet }))
        }
        menu={data.menu}
        onAddMenuItem={handleAddMenuItem}
        onUpdateMenuItem={handleUpdateMenuItem}
        onDeleteMenuItem={handleDeleteMenuItem}
        members={data.members}
        onAddMember={handleAddMember}
        onDeleteMember={handleDeleteMember}
        onResetTodayOrders={handleResetTodayOrders}
        onResetAllData={handleResetAllData}
        todayOrdersCount={data.orders.length}
      />

      {/* WhatsApp Summary Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        summaryText={whatsAppText}
      />
    </div>
  );
}
