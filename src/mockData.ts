import { Member, MenuItem, Order, Settings, DepositRecord } from './types';

export const INITIAL_SETTINGS: Settings = {
  messName: "মডার্ন ছাত্রাবাস ও মেস",
  timeRestrictionEnabled: false,
  startHour: 16,
  startMinute: 30,
  endHour: 19,
  endMinute: 1,
  currency: "৳",
  managerName: "ম্যানেজার",
  managerPhone: "01316831199",
  supportWhatsApp: "01316831199",
  adminPin: "1234",
  googleSheetScriptUrl: "https://script.google.com/macros/s/AKfycbwTyrRZz_K1Kpq3AvVK_w2_D0gVkc06tQs_b5Nt0cNn8yC6lJS6VQ2gfmSZlFBkSja7rQ/exec",
  isGoogleSheetConnected: true
};

export const INITIAL_MEMBERS: Member[] = [
  { id: "u-1", name: "Jahed", room: "G-13", phone: "01851388324", pin: "8324", balance: 250, giver: "Cash" },
  { id: "u-2", name: "Nafis", room: "G-13", phone: "01876707085", pin: "7085", balance: 500, giver: "Cash" },
  { id: "u-3", name: "Araf", room: "G-02", phone: "01557630058", pin: "0058", balance: 1000, giver: "Cash" },
  { id: "u-4", name: "Neshan", room: "G-12", phone: "01751292205", pin: "2205", balance: 500, giver: "Cash" },
  { id: "u-5", name: "Dhrubo", room: "D-04", phone: "01531531659", pin: "1659", balance: 100, giver: "Cash" },
  { id: "u-6", name: "Abid", room: "G-12", phone: "01734831607", pin: "1607", balance: 25, giver: "Cash" },
  { id: "u-7", name: "Fahad", room: "G-04", phone: "01740810655", pin: "0655", balance: 222, giver: "Cash" },
  { id: "u-8", name: "Mehrab", room: "G-02", phone: "01581506488", pin: "6488", balance: 50, giver: "Cash" },
  { id: "u-9", name: "Moon", room: "G-08", phone: "01610032849", pin: "2849", balance: 25, giver: "Cash" },
  { id: "u-10", name: "Abdullah", room: "G-07", phone: "01677389220", pin: "9220", balance: 360, giver: "Cash" },
  { id: "u-11", name: "Ashraful", room: "G-11", phone: "01863280486", pin: "0486", balance: 180, giver: "Cash" },
  { id: "u-12", name: "Atik", room: "G-11", phone: "01873819967", pin: "9967", balance: 350, giver: "Cash" },
  { id: "u-13", name: "Kiam", room: "D-01", phone: "01894754050", pin: "4050", balance: 368, giver: "Cash" },
  { id: "u-14", name: "Najmul", room: "D-01", phone: "01619117027", pin: "7027", balance: 24, giver: "Cash" },
  { id: "u-15", name: "Meharajul", room: "D-02", phone: "01789430462", pin: "0462", balance: 203, giver: "Cash" },
  { id: "u-16", name: "Hridoy", room: "G-04", phone: "01612634111", pin: "4111", balance: 120, giver: "Cash" },
  { id: "u-17", name: "Shaiket", room: "D-01", phone: "01766451722", pin: "1722", balance: 320, giver: "Cash" },
  { id: "u-18", name: "Farhad", room: "D-02", phone: "01847539434", pin: "9434", balance: 350, giver: "Cash" },
  { id: "u-19", name: "Rashed", room: "D-02", phone: "01743795580", pin: "5580", balance: 680, giver: "Cash" },
  { id: "u-20", name: "Barkatullah", room: "G-09", phone: "01603477661", pin: "7661", balance: 640, giver: "Cash" },
  { id: "u-21", name: "Emon", room: "G-10", phone: "01873827363", pin: "7363", balance: 230, giver: "Cash" },
  { id: "u-22", name: "Ashraful", room: "D-02", phone: "01616894750", pin: "4750", balance: 500, giver: "Cash" },
  { id: "u-23", name: "Jahid", room: "G-06", phone: "01739597316", pin: "7316", balance: 1000, giver: "Cash" },
  { id: "u-24", name: "Sajid", room: "D-10", phone: "01616913968", pin: "3968", balance: 500, giver: "Cash" },
  { id: "u-25", name: "Jihad", room: "G-11", phone: "01538313546", pin: "3546", balance: 100, giver: "Cash" },
  { id: "u-26", name: "Shifat", room: "G-09", phone: "01874116433", pin: "6433", balance: 25, giver: "Cash" },
  { id: "u-27", name: "Fahim", room: "G-04", phone: "01316831199", pin: "1199", balance: 222, giver: "Cash" },
  { id: "u-28", name: "Hasin", room: "D-09", phone: "01854310938", pin: "0938", balance: 50, giver: "Cash" },
  { id: "u-29", name: "Tarek", room: "G-08", phone: "01824283697", pin: "3697", balance: 25, giver: "Cash" },
  { id: "u-30", name: "Shakawat", room: "D-07", phone: "01748644559", pin: "4559", balance: 360, giver: "Cash" },
  { id: "u-31", name: "Shoumik", room: "G-01", phone: "01634845489", pin: "5489", balance: 180, giver: "Cash" },
  { id: "u-32", name: "Umar", room: "G-09", phone: "01823982946", pin: "2946", balance: 350, giver: "Cash" },
  { id: "u-33", name: "Mahabur", room: "D-08", phone: "01609542710", pin: "2710", balance: 368, giver: "Cash" },
  { id: "u-34", name: "Zahid", room: "D-03", phone: "01860921615", pin: "1615", balance: 500, giver: "Cash" },
  { id: "u-35", name: "Miraj", room: "G-11", phone: "01976539319", pin: "9319", balance: 1000, giver: "Cash" },
  { id: "u-36", name: "Jabed", room: "D-08", phone: "01868671825", pin: "1825", balance: 500, giver: "Cash" }
];

export const INITIAL_MENU: MenuItem[] = [
  { id: "m-1", name: "মুরগীর মাংস", price: 70, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-2", name: "গরুর মাংস", price: 100, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-3", name: "ইলিশ মাছ", price: 75, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-4", name: "পাঙ্গাস মাছ", price: 65, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-5", name: "হাসের মাংস", price: 115, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-6", name: "সোনালী মুরগী", price: 95, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-7", name: "খাসির মাংস", price: 130, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-8", name: "কাচকি মাছ", price: 65, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-9", name: "রুই মাছ", price: 65, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-10", name: "সিলভার মাছ", price: 65, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-11", name: "ডিম", price: 40, isAvailable: true, description: "ভাত ও ডাল ফ্রি" },
  { id: "m-12", name: "পাাবদা মাছ", price: 75, isAvailable: true, description: "ভাত ও ডাল ফ্রি" }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_DEPOSIT_RECORDS: DepositRecord[] = [];
