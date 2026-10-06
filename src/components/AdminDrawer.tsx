import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Utensils,
  Users,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  Lock,
  Save,
  Phone
} from 'lucide-react';
import { Member, MenuItem, Settings } from '../types';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  menu: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  onResetTodayOrders: () => void;
  onResetAllData: () => void;
  todayOrdersCount: number;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  menu,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  members,
  onAddMember,
  onDeleteMember,
  onResetTodayOrders,
  onResetAllData,
  todayOrdersCount
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'members' | 'settings' | 'reset'>('menu');

  // Form states for menu
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState<number>(100);
  const [newMenuDesc, setNewMenuDesc] = useState('');

  // Form states for member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRoom, setNewMemberRoom] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberPin, setNewMemberPin] = useState('');
  const [newMemberBalance, setNewMemberBalance] = useState<number>(500);

  // Settings state
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  if (!isOpen) return null;

  const totalMembersBalance = members.reduce((sum, m) => sum + (m.balance || 0), 0);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    alert('Settings saved successfully!');
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim() || newMenuPrice <= 0) return;
    onAddMenuItem({
      name: newMenuName.trim(),
      price: newMenuPrice,
      isAvailable: true,
      description: newMenuDesc.trim()
    });
    setNewMenuName('');
    setNewMenuPrice(100);
    setNewMenuDesc('');
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRoom.trim()) return;
    onAddMember({
      name: newMemberName.trim(),
      room: newMemberRoom.trim(),
      phone: newMemberPhone.trim() || '01700000000',
      pin: newMemberPin.trim() || '1234',
      balance: newMemberBalance,
      giver: 'Cash'
    });
    setNewMemberName('');
    setNewMemberRoom('');
    setNewMemberPhone('');
    setNewMemberPin('');
    setNewMemberBalance(500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Manager Panel</h3>
              <p className="text-xs text-slate-300">Manage food menu, members & settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs sm:text-sm font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'menu'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Food Menu ({menu.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'members'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members & Balance ({members.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reset'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Day</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: MENU MANAGEMENT */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              {/* Add Menu Form */}
              <form
                onSubmit={handleCreateMenuItem}
                className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3"
              >
                <div className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span>Add New Menu Item</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="Item name (e.g. Beef Biryani)"
                    className="sm:col-span-2 p-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl"
                    required
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                      BDT
                    </span>
                    <input
                      type="number"
                      min="10"
                      value={newMenuPrice}
                      onChange={(e) => setNewMenuPrice(Number(e.target.value))}
                      placeholder="Price"
                      className="w-full pl-12 pr-2.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl font-bold"
                      required
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  Save Item
                </button>
              </form>

              {/* Menu List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  Current Menu Items:
                </div>
                {menu.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-800">{item.name}</div>
                      <div className="text-xs text-emerald-700 font-bold">
                        {item.price} BDT
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400">{item.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateMenuItem({ ...item, isAvailable: !item.isAvailable })
                        }
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {item.isAvailable ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.name}"?`)) {
                            onDeleteMenuItem(item.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS MANAGEMENT */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500">Total Members Balance</div>
                  <div className="text-lg font-black text-emerald-700">
                    {totalMembersBalance} BDT
                  </div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500">Total Members</div>
                  <div className="text-lg font-black text-slate-800">
                    {members.length}
                  </div>
                </div>
              </div>

              {/* Add member form */}
              <form
                onSubmit={handleCreateMember}
                className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3"
              >
                <div className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span>Add New Member</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Member name"
                    className="p-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={newMemberRoom}
                    onChange={(e) => setNewMemberRoom(e.target.value)}
                    placeholder="Room (e.g. G-04)"
                    className="p-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="Phone (01XXXXXXXXX)"
                    className="p-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl font-mono"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">
                      PIN:
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      value={newMemberPin}
                      onChange={(e) => setNewMemberPin(e.target.value)}
                      placeholder="Security PIN"
                      className="w-full pl-12 pr-2.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl font-bold text-emerald-800"
                      required
                    />
                  </div>
                  <input
                    type="number"
                    value={newMemberBalance}
                    onChange={(e) => setNewMemberBalance(Number(e.target.value))}
                    placeholder="Initial deposit (BDT)"
                    className="p-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl font-bold sm:col-span-2"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  Save Member
                </button>
              </form>

              {/* Members List with FULL PHONE NUMBERS & BALANCES */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  All Members (Admin View):
                </div>
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {m.name} (Room {m.room})
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-700 mt-0.5">
                        Phone: <span className="text-emerald-950 bg-slate-100 px-1 py-0.5 rounded">{m.phone}</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-800 mt-0.5">
                        PIN: <span className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{m.pin || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold">Balance</div>
                        <span className="font-black text-sm text-emerald-700">
                          {m.balance} BDT
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete member "${m.name}"?`)) {
                            onDeleteMember(m.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Admin PIN Password</span>
                </div>
                <input
                  type="text"
                  maxLength={10}
                  value={localSettings.adminPin}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, adminPin: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold font-mono text-emerald-800"
                  required
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>Support WhatsApp Number</span>
                </div>
                <input
                  type="text"
                  value={localSettings.supportWhatsApp}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, supportWhatsApp: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono text-slate-800"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </form>
          )}

          {/* TAB 4: RESET / NEXT DAY */}
          {activeTab === 'reset' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl">
                <div className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>Start New Day's Orders</span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Clears today's orders list for the next meal cycle while keeping records.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      if (confirm('Clear today\'s orders and start fresh for tomorrow?')) {
                        onResetTodayOrders();
                        alert('New day orders initiated!');
                      }
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                  >
                    Start Next Day ({todayOrdersCount} orders cleared)
                  </button>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-300 rounded-2xl">
                <div className="font-bold text-red-900 text-sm">Reload Google Sheet Data</div>
                <p className="text-xs text-red-800 mt-1">
                  Refresh all users and menu items directly from Google Sheet.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      if (confirm('Reload latest data from Google Sheet?')) {
                        onResetAllData();
                        alert('Data refreshed successfully!');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                  >
                    Reload Google Sheet Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
