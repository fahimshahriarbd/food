export interface Member {
  id: string;
  name: string;
  room: string;
  phone: string;
  balance: number;
  pin: string; // User PIN for order verification
  giver?: string;
  lastDepositDate?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category?: 'beef' | 'chicken' | 'fish' | 'egg' | 'rice' | 'special';
  isAvailable: boolean;
  description?: string;
}

export interface Order {
  id: string;
  memberId: string;
  name: string;
  room: string;
  phone: string;
  displayString: string;
  menuId: string;
  menuName: string;
  price: number;
  orderedAt: string;
  notes?: string;
}

export interface DepositRecord {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  type: 'deposit' | 'deduction' | 'adjustment';
  method: 'bKash' | 'Nagad' | 'Cash' | 'Rocket' | 'Bank';
  giver: string;
  date: string;
  note?: string;
}

export interface Settings {
  messName: string;
  timeRestrictionEnabled: boolean;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  currency: string;
  managerName: string;
  managerPhone: string;
  supportWhatsApp: string; // 01316831199
  adminPin: string; // Admin Manager PIN (e.g. 1234 or from Google Sheet)
  googleSheetScriptUrl?: string; // Web app URL from Google Apps Script
  isGoogleSheetConnected?: boolean;
}
