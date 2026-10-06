import React, { useState } from 'react';
import {
  Utensils,
  Users,
  Share2,
  FileDown,
  Trash2,
  Clock,
  Search
} from 'lucide-react';
import { Order, MenuItem, Settings } from '../types';
import { maskPhoneNumber, downloadOrPrintPDF } from '../storage';

interface OrderStatsProps {
  orders: Order[];
  menu: MenuItem[];
  totalPrice: number;
  menuCount: Record<string, number>;
  isAdmin: boolean;
  onCancelOrder: (orderId: string) => void;
  onOpenWhatsAppModal: () => void;
  settings: Settings;
}

export const OrderStats: React.FC<OrderStatsProps> = ({
  orders,
  menu,
  totalPrice,
  menuCount,
  isAdmin,
  onCancelOrder,
  onOpenWhatsAppModal,
  settings
}) => {
  const [orderSearch, setOrderSearch] = useState('');

  // Filter orders by search
  const filteredOrders = orders.filter((o) => {
    if (!orderSearch.trim()) return true;
    const term = orderSearch.toLowerCase();
    return (
      o.name.toLowerCase().includes(term) ||
      o.room.toLowerCase().includes(term) ||
      o.menuName.toLowerCase().includes(term)
    );
  });

  const handleDownloadPDF = () => {
    downloadOrPrintPDF(orders, menuCount, totalPrice, settings.messName);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Food Summary Table */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  Food Summary
                </h3>
                <p className="text-xs text-slate-500">Item-wise total quantities</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-200 text-emerald-900 rounded-full">
              Total: {orders.length}
            </span>
          </div>

          <div className="p-4 flex-1">
            {Object.keys(menuCount).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Utensils className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-medium">No meal orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table id="ordersTable" className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-emerald-700 text-white text-xs sm:text-sm">
                      <th className="py-2.5 px-3 rounded-l-xl font-bold">Food Item</th>
                      <th className="py-2.5 px-3 rounded-r-xl font-bold text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {Object.entries(menuCount).map(([menuName, count], idx) => {
                      const menuItem = menu.find((m) => m.name === menuName);
                      const subtotal = menuItem ? menuItem.price * count : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{menuName}</div>
                            {menuItem && (
                              <div className="text-xs text-slate-500">
                                {menuItem.price} BDT x {count} = {subtotal} BDT
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center justify-center font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs sm:text-sm">
                              {count}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 2. Order List Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  Order List
                </h3>
                <p className="text-xs text-slate-500">Today's booked meals</p>
              </div>
            </div>

            {/* Action buttons: WhatsApp & Download PDF */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenWhatsAppModal}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Share order summary to WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Download or Print PDF (Secure: No Phone Numbers)"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-300" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Quick search */}
          {orders.length > 3 && (
            <div className="px-4 pt-3 pb-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by name, room, or food item..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div className="p-4 flex-1">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-medium">
                  {orderSearch ? 'No matching orders' : 'No orders yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                <table id="orderNamesTable" className="w-full border-collapse text-left">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-emerald-700 text-white text-xs sm:text-sm">
                      <th className="py-2.5 px-3 rounded-l-xl font-bold">
                        Orderer
                      </th>
                      <th className="py-2.5 px-3 font-bold">Food Item</th>
                      {isAdmin && (
                        <th className="py-2.5 px-3 rounded-r-xl font-bold text-center">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredOrders.map((order, index) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 text-left">
                          <div className="font-bold text-slate-900">
                            {index + 1}. {order.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Room: {order.room}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">
                              {isAdmin ? order.phone : maskPhoneNumber(order.phone)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-400">
                              <Clock className="w-3 h-3" />
                              {new Date(order.orderedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-left">
                          <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60 inline-block">
                            {order.menuName}
                          </span>
                          <div className="text-xs text-slate-500 mt-0.5 font-medium">
                            {order.price} BDT
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => onCancelOrder(order.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancel order & refund"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
