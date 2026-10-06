import { Member, MenuItem, Order, Settings } from './types';

// The complete Google Apps Script code for the user to copy-paste into Extensions > Apps Script
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * সেহরির খাবার অর্ডার ও মেস ম্যানেজমেন্ট - গুগল অ্যাপস স্ক্রিপ্ট (Code.gs)
 * ====================================================================
 * 
 * কীভাবে সেটআপ করবেন:
 * ১. একটি নতুন Google Sheet খুলুন (যেমন: "Sehri Food Mess").
 * ২. নিচের ৪টি শিট (Sheet Tabs) তৈরি করুন:
 *    - "Users"
 *    - "Menu"
 *    - "Orders"
 *    - "Settings"
 * 
 * ৩. শিটের হেডার কলামগুলো এভাবে লিখুন:
 *    [Users শিট]:
 *    A1: Name | B1: Room | C1: Phone | D1: PIN | E1: Balance | F1: Giver
 * 
 *    [Menu শিট]:
 *    A1: Item Name | B1: Price | C1: Available | D1: Description
 * 
 *    [Orders শিট]:
 *    A1: Name | B1: Room | C1: Phone | D1: Food Item | E1: Price | F1: Timestamp
 * 
 *    [Settings শিট]:
 *    A1: Key | B1: Value
 *    A2: AdminPIN       | B2: 1234
 *    A3: WhatsApp       | B3: 01316831199
 *    A4: MessName       | B4: মডার্ন ছাত্রাবাস ও মেস
 *    A5: TimeRestricted | B5: No
 * 
 * ৪. Extensions > Apps Script এ যান। এই পুরো কোডটি পেস্ট করুন।
 * ৫. Deploy > New deployment > Select type: Web app > 
 *    - Execute as: Me (আপনার ইমেইল)
 *    - Who has access: Anyone (যেকোনো ব্যক্তি)
 * ৬. Deploy বাটনে চাপুন এবং প্রাপ্ত Web App URL টি কপি করে অ্যাপের সেটিংসে দিন!
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'getData';
  
  if (action === 'getData') {
    return ContentService.createTextOutput(JSON.stringify(getData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Sehri Food API Running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    
    if (action === 'placeOrder') {
      var result = submitOrder(contents.userName, contents.pin, contents.menuName);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'addMenuItem') {
      var res = addMenuItem(contents.item);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'deleteMenuItem') {
      var delRes = deleteMenuItem(contents.menuName);
      return ContentService.createTextOutput(JSON.stringify(delRes))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // ১. ইউজার ডাটা রিড
  var userSheet = ss.getSheetByName("Users");
  var users = [];
  if (userSheet) {
    var uData = userSheet.getDataRange().getValues();
    for (var i = 1; i < uData.length; i++) {
      if (uData[i][0]) {
        users.push({
          id: "u-" + i,
          name: String(uData[i][0]),
          room: String(uData[i][1]),
          phone: String(uData[i][2]),
          pin: String(uData[i][3]),
          balance: parseFloat(uData[i][4]) || 0,
          giver: String(uData[i][5] || "")
        });
      }
    }
  }
  
  // ২. মেনু ডাটা রিড
  var menuSheet = ss.getSheetByName("Menu");
  var menus = [];
  if (menuSheet) {
    var mData = menuSheet.getDataRange().getValues();
    for (var j = 1; j < mData.length; j++) {
      if (mData[j][0]) {
        menus.push({
          id: "m-" + j,
          name: String(mData[j][0]),
          price: parseFloat(mData[j][1]) || 0,
          isAvailable: String(mData[j][2]).toLowerCase() !== 'no',
          description: String(mData[j][3] || "")
        });
      }
    }
  }
  
  // ৩. অর্ডার ডাটা রিড
  var orderSheet = ss.getSheetByName("Orders");
  var orders = [];
  if (orderSheet) {
    var oData = orderSheet.getDataRange().getValues();
    for (var k = 1; k < oData.length; k++) {
      if (oData[k][0]) {
        orders.push({
          id: "ord-" + k,
          name: String(oData[k][0]),
          room: String(oData[k][1]),
          phone: String(oData[k][2]),
          menuName: String(oData[k][3]),
          price: parseFloat(oData[k][4]) || 0,
          orderedAt: String(oData[k][5] || new Date().toISOString())
        });
      }
    }
  }
  
  // ৪. সেটিংস রিড
  var settingsSheet = ss.getSheetByName("Settings");
  var adminPin = "1234";
  var whatsapp = "01316831199";
  var messName = "মডার্ন ছাত্রাবাস ও মেস";
  if (settingsSheet) {
    var sData = settingsSheet.getDataRange().getValues();
    for (var s = 1; s < sData.length; s++) {
      var key = String(sData[s][0]).trim();
      var val = String(sData[s][1]).trim();
      if (key === 'AdminPIN') adminPin = val;
      if (key === 'WhatsApp') whatsapp = val;
      if (key === 'MessName') messName = val;
    }
  }
  
  return {
    status: 'success',
    users: users,
    menus: menus,
    orders: orders,
    settings: {
      adminPin: adminPin,
      supportWhatsApp: whatsapp,
      messName: messName
    }
  };
}

function submitOrder(userName, enteredPin, menuName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var userSheet = ss.getSheetByName("Users");
  var menuSheet = ss.getSheetByName("Menu");
  var orderSheet = ss.getSheetByName("Orders");
  
  // ১. ইউজার ও পিন চেক
  var uData = userSheet.getDataRange().getValues();
  var userRow = -1;
  var userObj = null;
  for (var i = 1; i < uData.length; i++) {
    if (String(uData[i][0]).trim() === String(userName).trim()) {
      userRow = i + 1;
      userObj = {
        name: String(uData[i][0]),
        room: String(uData[i][1]),
        phone: String(uData[i][2]),
        pin: String(uData[i][3]).trim(),
        balance: parseFloat(uData[i][4]) || 0
      };
      break;
    }
  }
  
  if (!userObj) {
    return { status: 'user_not_found', message: 'User not found in Google Sheet' };
  }
  
  // পিন ম্যাচ চেক
  if (String(userObj.pin) !== String(enteredPin).trim()) {
    return { status: 'invalid_pin', message: 'Incorrect PIN' };
  }
  
  // ২. মেনু ও প্রাইস চেক
  var mData = menuSheet.getDataRange().getValues();
  var price = 0;
  for (var j = 1; j < mData.length; j++) {
    if (String(mData[j][0]).trim() === String(menuName).trim()) {
      price = parseFloat(mData[j][1]) || 0;
      break;
    }
  }
  
  // ৩. ব্যালেন্স চেক
  if (userObj.balance < price) {
    return { status: 'insufficient_balance', message: 'Insufficient balance' };
  }
  
  // ৪. ডুপ্লিকেট চেক (আজকের অর্ডার)
  var oData = orderSheet.getDataRange().getValues();
  for (var k = 1; k < oData.length; k++) {
    if (String(oData[k][0]).trim() === String(userName).trim()) {
      return { status: 'already_ordered', message: 'Already ordered today' };
    }
  }
  
  // ৫. ব্যালেন্স কর্তন এবং শিটে অর্ডার যোগ
  userSheet.getRange(userRow, 5).setValue(userObj.balance - price);
  orderSheet.appendRow([userObj.name, userObj.room, userObj.phone, menuName, price, new Date()]);
  
  return {
    status: 'success',
    newBalance: userObj.balance - price,
    message: 'Order placed successfully'
  };
}

function addMenuItem(item) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuSheet = ss.getSheetByName("Menu");
  menuSheet.appendRow([item.name, item.price, item.isAvailable ? 'Yes' : 'No', item.description || '']);
  return { status: 'success' };
}

function deleteMenuItem(menuName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuSheet = ss.getSheetByName("Menu");
  var data = menuSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(menuName).trim()) {
      menuSheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'not_found' };
}
`;

export async function fetchGoogleSheetData(scriptUrl: string) {
  try {
    const url = `${scriptUrl}?action=getData`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error: ' + response.statusText);
    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error('Google Sheet fetch error:', err);
    throw err;
  }
}

export async function postOrderToGoogleSheet(
  scriptUrl: string,
  userName: string,
  pin: string,
  menuName: string
) {
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // avoids CORS preflight issues with Google Apps Script
      },
      body: JSON.stringify({
        action: 'placeOrder',
        userName,
        pin,
        menuName
      })
    });
    const result = await response.json();
    return result;
  } catch (err: any) {
    console.error('Google Sheet submit error:', err);
    throw err;
  }
}
