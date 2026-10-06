import { Member, MenuItem, Order, Settings, DepositRecord } from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_MENU,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  INITIAL_DEPOSIT_RECORDS
} from './mockData';

export const HARDCODED_GOOGLE_SHEET_URL =
  'https://script.google.com/macros/s/AKfycbwTyrRZz_K1Kpq3AvVK_w2_D0gVkc06tQs_b5Nt0cNn8yC6lJS6VQ2gfmSZlFBkSja7rQ/exec';

const STORAGE_KEYS = {
  MEMBERS: 'sehri_members_v3',
  MENU: 'sehri_menu_v3',
  ORDERS: 'sehri_today_orders_v3',
  SETTINGS: 'sehri_settings_v3',
  DEPOSITS: 'sehri_deposits_v3',
  ORDER_HISTORY: 'sehri_order_history_v3'
};

export const maskPhoneNumber = (phone?: string): string => {
  if (!phone) return '01X****XX';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length >= 7) {
    const first3 = clean.slice(0, 3);
    const last2 = clean.slice(-2);
    return `${first3}****${last2}`;
  }
  return phone;
};

export const loadStoredData = () => {
  try {
    const members: Member[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MEMBERS) || JSON.stringify(INITIAL_MEMBERS)
    );
    const menu: MenuItem[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MENU) || JSON.stringify(INITIAL_MENU)
    );
    const orders: Order[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ORDERS) || JSON.stringify(INITIAL_ORDERS)
    );
    const settings: Settings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify({
        ...INITIAL_SETTINGS,
        googleSheetScriptUrl: HARDCODED_GOOGLE_SHEET_URL,
        isGoogleSheetConnected: true
      })
    );
    settings.googleSheetScriptUrl = HARDCODED_GOOGLE_SHEET_URL;

    const deposits: DepositRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.DEPOSITS) || JSON.stringify(INITIAL_DEPOSIT_RECORDS)
    );
    const orderHistory: Order[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ORDER_HISTORY) || JSON.stringify(INITIAL_ORDERS)
    );

    return { members, menu, orders, settings, deposits, orderHistory };
  } catch {
    return {
      members: INITIAL_MEMBERS,
      menu: INITIAL_MENU,
      orders: INITIAL_ORDERS,
      settings: {
        ...INITIAL_SETTINGS,
        googleSheetScriptUrl: HARDCODED_GOOGLE_SHEET_URL,
        isGoogleSheetConnected: true
      },
      deposits: INITIAL_DEPOSIT_RECORDS,
      orderHistory: INITIAL_ORDERS
    };
  }
};

export const saveStoredData = (data: {
  members?: Member[];
  menu?: MenuItem[];
  orders?: Order[];
  settings?: Settings;
  deposits?: DepositRecord[];
  orderHistory?: Order[];
}) => {
  if (data.members) localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
  if (data.menu) localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(data.menu));
  if (data.orders) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders));
  if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
  if (data.deposits) localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(data.deposits));
  if (data.orderHistory) localStorage.setItem(STORAGE_KEYS.ORDER_HISTORY, JSON.stringify(data.orderHistory));
};

export const resetToDefaults = () => {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(
    STORAGE_KEYS.SETTINGS,
    JSON.stringify({
      ...INITIAL_SETTINGS,
      googleSheetScriptUrl: HARDCODED_GOOGLE_SHEET_URL,
      isGoogleSheetConnected: true
    })
  );
  localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(INITIAL_DEPOSIT_RECORDS));
  localStorage.setItem(STORAGE_KEYS.ORDER_HISTORY, JSON.stringify(INITIAL_ORDERS));
};

export const toBengaliNumber = (num: number | string): string => {
  return String(num);
};

export const formatTaka = (amount: number): string => {
  return `${amount} BDT`;
};

// Format member display string with masked phone
export const formatMemberLabel = (m: Member, mask: boolean = true): string => {
  const phoneStr = mask ? maskPhoneNumber(m.phone) : m.phone;
  return `${m.name}:${m.room} (${phoneStr})`;
};

export const isWithinOrderWindow = (settings: Settings, testDate?: Date): {
  isOpen: boolean;
  message: string;
  remainingMinutes?: number;
} => {
  if (!settings.timeRestrictionEnabled) {
    return {
      isOpen: true,
      message: 'Orders Open'
    };
  }

  const now = testDate || new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = settings.startHour * 60 + settings.startMinute;
  const endMinutes = settings.endHour * 60 + settings.endMinute;

  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    const remaining = endMinutes - currentMinutes;
    return {
      isOpen: true,
      message: `Time left: ${remaining}m`,
      remainingMinutes: remaining
    };
  }

  return {
    isOpen: false,
    message: 'Time: 4:30 PM - 7:01 PM'
  };
};

export const generateWhatsAppSummary = (
  orders: Order[],
  menuCount: Record<string, number>,
  totalPrice: number,
  messName: string
): string => {
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let text = `🌙 *${messName} - Meal Orders*\n`;
  text += `📅 Date: ${dateStr}\n`;
  text += `👥 Total Orders: ${orders.length}\n`;
  text += `💰 Total Bill: ${totalPrice} BDT\n\n`;

  text += `📋 *Food Summary:*\n`;
  Object.entries(menuCount).forEach(([item, count]) => {
    text += `▪ ${item}: *${count}*\n`;
  });

  text += `\n👤 *Order List:*\n`;
  orders.forEach((ord, idx) => {
    text += `${idx + 1}. ${ord.name} (Room ${ord.room}) -> ${ord.menuName}\n`;
  });

  return text;
};

// Security-compliant PDF Printable Generator in clean English
export const downloadOrPrintPDF = (
  orders: Order[],
  menuCount: Record<string, number>,
  totalPrice: number,
  messName: string
) => {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups to print PDF.');
    return;
  }

  const menuRows = Object.entries(menuCount)
    .map(
      ([menuName, count]) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">${menuName}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #047857;">${count}</td>
      </tr>
    `
    )
    .join('');

  // Strictly exclude mobile numbers!
  const orderRows = orders
    .map(
      (ord, idx) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 600;">${ord.name}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">${ord.room}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 600; color: #065f46;">${ord.menuName}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: right;">${ord.price} BDT</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center; color: #64748b; font-size: 12px;">${new Date(ord.orderedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Sehri Meal Order - ${dateStr}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          background: #ffffff;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #059669;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        h1 { margin: 0; font-size: 22px; color: #065f46; }
        p { margin: 4px 0 0; color: #475569; font-size: 13px; }
        .summary-box {
          display: flex;
          justify-content: space-around;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .summary-item { text-align: center; }
        .summary-title { font-size: 12px; color: #475569; font-weight: bold; }
        .summary-value { font-size: 20px; color: #047857; font-weight: 800; }
        h2 { font-size: 15px; margin: 20px 0 8px; color: #1e293b; border-left: 4px solid #059669; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
        th { background: #047857; color: #ffffff; padding: 9px 12px; text-align: left; }
        .security-badge {
          text-align: center;
          font-size: 11px;
          color: #64748b;
          border-top: 1px dashed #cbd5e1;
          padding-top: 12px;
          margin-top: 30px;
        }
        @media print {
          body { padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${messName}</h1>
        <p>Meal Order Summary — <b>${dateStr}</b></p>
      </div>

      <div class="summary-box">
        <div class="summary-item">
          <div class="summary-title">Total Orders</div>
          <div class="summary-value">${orders.length}</div>
        </div>
        <div class="summary-item">
          <div class="summary-title">Total Amount</div>
          <div class="summary-value">${totalPrice} BDT</div>
        </div>
      </div>

      <h2>Food Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Food Item</th>
            <th style="text-align: center; width: 120px;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${menuRows || '<tr><td colspan="2" style="text-align: center; padding: 12px;">No orders today</td></tr>'}
        </tbody>
      </table>

      <h2>Order List</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">#</th>
            <th>Name</th>
            <th style="width: 80px; text-align: center;">Room</th>
            <th>Food Item</th>
            <th style="width: 80px; text-align: right;">Price</th>
            <th style="width: 100px; text-align: center;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${orderRows || '<tr><td colspan="6" style="text-align: center; padding: 12px;">No orders today</td></tr>'}
        </tbody>
      </table>

      <div class="security-badge">
        Protected document: No personal contact numbers are displayed.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
