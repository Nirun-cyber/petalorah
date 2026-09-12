import type { LoggedOrder } from '../context/OrderContext';

export interface GoogleSheetOrderPayload {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  totalItems: number;
  totalAmount: number;
  channel: string;
  status: string;
  courierPartner?: string;
  trackingNumber?: string;
}

/**
 * Extracts Google Spreadsheet ID from various URL formats or returns raw ID.
 */
export const extractSpreadsheetId = (input: string): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Direct sheet ID (alphanumeric string with hyphens/underscores, usually 40+ chars)
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  // Format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
};

export const isDirectGoogleSheetUrl = (url: string): boolean => {
  return !url.includes('script.google.com') && extractSpreadsheetId(url) !== null;
};

export const isGoogleAppsScriptUrl = (url: string): boolean => {
  return url.includes('script.google.com/macros/s/');
};

/**
 * Normalizes status strings from various accounting apps into Petalorah status types
 */
export const normalizeOrderStatus = (rawStatus?: string): LoggedOrder['status'] => {
  if (!rawStatus) return 'New';
  const s = rawStatus.toLowerCase().trim();

  if (s.includes('deliver') || s.includes('complete') || s.includes('received')) {
    return 'Delivered';
  }
  if (s.includes('dispatch') || s.includes('ship') || s.includes('transit') || s.includes('out for delivery')) {
    return 'Dispatched';
  }
  if (s.includes('pack') || s.includes('ready')) {
    return 'Packed';
  }
  if (s.includes('craft') || s.includes('making') || s.includes('progress') || s.includes('process')) {
    return 'Crafting';
  }
  if (s.includes('contact') || s.includes('confirm')) {
    return 'Contacted';
  }
  if (s.includes('cancel') || s.includes('reject')) {
    return 'Cancelled';
  }
  return 'New';
};

/**
 * Formats a single Petalorah order into Google Sheets row payload
 */
export const formatOrderForGoogleSheet = (order: LoggedOrder): GoogleSheetOrderPayload => {
  const itemsSummary = order.items && order.items.length > 0
    ? order.items
        .map((item) => `${item.productName} (x${item.quantity}) - ₹${item.price * item.quantity}`)
        .join('; ')
    : 'Handcrafted Order';

  return {
    orderId: order.id,
    createdAt: new Date(order.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    customerName: order.customerName || 'Customer',
    customerPhone: order.customerPhone || '',
    itemsSummary,
    totalItems: order.totalItems || 1,
    totalAmount: order.totalAmount || 0,
    channel: order.channel || 'Direct',
    status: order.status || 'New',
    courierPartner: order.courierPartner || '',
    trackingNumber: order.trackingNumber || '',
  };
};

/**
 * Parses Google Visualization (gviz) JSON response into standardized LoggedOrder items.
 */
export const parseGvizData = (gvizText: string): LoggedOrder[] => {
  try {
    const jsonStart = gvizText.indexOf('{');
    const jsonEnd = gvizText.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return [];

    const jsonString = gvizText.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonString);
    const table = parsed.table;
    if (!table || !table.rows) return [];

    // Identify header positions
    let headers: string[] = [];
    let dataRows = table.rows;

    // Check if cols have labels
    if (table.cols && table.cols.some((c: { label?: string }) => c.label && c.label.trim().length > 0)) {
      headers = table.cols.map((c: { label?: string }) => (c.label || '').toLowerCase().trim());
    } else if (table.rows.length > 0) {
      // First row contains the headers
      const firstRow = table.rows[0];
      headers = (firstRow.c || []).map((cell: { v?: any; f?: string } | null) =>
        cell ? String(cell.v || cell.f || '').toLowerCase().trim() : ''
      );
      dataRows = table.rows.slice(1);
    }

    const findIndex = (patterns: RegExp[]): number => {
      for (const pattern of patterns) {
        const idx = headers.findIndex((h) => pattern.test(h));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    // Standard column mappings
    const orderIdIdx = findIndex([/order\s*id/i, /order_id/i, /^id$/i, /order\s*no/i, /invoice/i, /bill\s*no/i]);
    const dateIdx = findIndex([/date/i, /time/i, /created/i, /timestamp/i]);
    const nameIdx = findIndex([/customer\s*name/i, /client\s*name/i, /party\s*name/i, /buyer/i, /^name$/i]);
    const phoneIdx = findIndex([/phone/i, /mobile/i, /contact/i, /whatsapp/i]);
    const itemsIdx = findIndex([/item/i, /product/i, /description/i, /particular/i, /summary/i]);
    const countIdx = findIndex([/total\s*items/i, /items\s*count/i, /qty/i, /quantity/i]);
    const amountIdx = findIndex([/total\s*amount/i, /grand\s*total/i, /amount/i, /total/i, /price/i]);
    const channelIdx = findIndex([/channel/i, /source/i, /platform/i]);
    const statusIdx = findIndex([/order\s*status/i, /^status$/i, /state/i]);
    const courierIdx = findIndex([/courier/i, /carrier/i, /delivery\s*partner/i, /shipping\s*partner/i]);
    const trackingIdx = findIndex([/tracking/i, /awb/i, /waybill/i, /consignment/i]);

    const orders: LoggedOrder[] = [];

    dataRows.forEach((row: { c: Array<{ v?: any; f?: string } | null> }, index: number) => {
      const cells = row.c || [];
      const getVal = (idx: number): string => {
        if (idx === -1 || idx >= cells.length || !cells[idx]) return '';
        const cell = cells[idx];
        return String(cell.f !== undefined && cell.f !== null ? cell.f : (cell.v !== undefined && cell.v !== null ? cell.v : '')).trim();
      };

      // Fallback: If orderId column wasn't explicitly found by header name, try column 0
      let orderId = getVal(orderIdIdx !== -1 ? orderIdIdx : 0);
      if (!orderId || orderId.toLowerCase() === 'order id' || orderId.toLowerCase() === 'id') {
        return; // Skip header repetition or empty row
      }

      const rawAmount = getVal(amountIdx);
      const cleanAmount = parseFloat(rawAmount.replace(/[^0-9.]/g, '')) || 0;

      const rawCount = getVal(countIdx);
      const totalItems = parseInt(rawCount.replace(/[^0-9]/g, ''), 10) || 1;

      const customerName = getVal(nameIdx) || 'Valued Customer';
      const customerPhone = getVal(phoneIdx);
      const rawStatus = getVal(statusIdx);
      const status = normalizeOrderStatus(rawStatus);

      const itemsSummary = getVal(itemsIdx) || 'Petalorah Handcrafted Keepsake';
      const courierPartner = getVal(courierIdx) || 'Handcrafted Express Delivery';
      const trackingNumber = getVal(trackingIdx);
      const rawDate = getVal(dateIdx);

      let createdAt = new Date().toISOString();
      if (rawDate) {
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
          createdAt = parsedDate.toISOString();
        }
      }

      const orderItem = {
        productId: `custom-${index}`,
        productName: itemsSummary,
        quantity: totalItems,
        price: cleanAmount,
        img: '/assets/products/rose.jpg',
      };

      orders.push({
        id: orderId,
        createdAt,
        customerName,
        customerPhone,
        items: [orderItem],
        totalItems,
        totalAmount: cleanAmount,
        channel: (getVal(channelIdx) as 'WhatsApp' | 'Instagram') || 'WhatsApp',
        status,
        courierPartner,
        trackingNumber: trackingNumber || undefined,
        estimatedDelivery: status === 'Delivered' ? 'Delivered' : 'Estimated 3-5 business days',
      });
    });

    return orders;
  } catch (err) {
    console.error('Failed to parse Google Sheets gviz data:', err);
    return [];
  }
};

/**
 * Fetches all orders from Google Sheet (either via direct public spreadsheet link or Apps Script Web App).
 */
export const fetchOrdersFromGoogleSheet = async (urlOrId: string): Promise<LoggedOrder[]> => {
  if (!urlOrId || !urlOrId.trim()) return [];
  const trimmed = urlOrId.trim();

  // 1. Check if it is a Google Apps Script Web App URL
  if (isGoogleAppsScriptUrl(trimmed)) {
    try {
      const fetchUrl = `${trimmed}${trimmed.includes('?') ? '&' : '?'}action=getOrders&t=${Date.now()}`;
      const res = await fetch(fetchUrl, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.orders)) {
        return data.orders.map((o: any) => ({
          ...o,
          status: normalizeOrderStatus(o.status),
          items: o.items && o.items.length > 0 ? o.items : [
            {
              productId: 'sheet-item',
              productName: o.itemsSummary || 'Handcrafted Order',
              quantity: o.totalItems || 1,
              price: o.totalAmount || 0,
              img: '/assets/products/rose.jpg',
            }
          ]
        }));
      }
    } catch (err) {
      console.warn('Google Apps Script fetchOrders error:', err);
    }
  }

  // 2. Direct Google Sheet public feed via Google Visualization API
  const sheetId = extractSpreadsheetId(trimmed);
  if (sheetId) {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&t=${Date.now()}`;
      const res = await fetch(gvizUrl);
      if (!res.ok) throw new Error(`Failed to fetch sheet gviz: ${res.status}`);
      const text = await res.text();
      return parseGvizData(text);
    } catch (err) {
      console.error('Failed to fetch from Google Sheet URL:', err);
    }
  }

  return [];
};

/**
 * Searches for a specific order in Google Sheet by Order ID or Phone number.
 */
export const searchOrderInGoogleSheet = async (
  query: string,
  urlOrId: string
): Promise<LoggedOrder | null> => {
  const clean = query.trim().toLowerCase();
  if (!clean || !urlOrId) return null;

  // Try fetching rows and matching
  const orders = await fetchOrdersFromGoogleSheet(urlOrId);
  if (!orders || orders.length === 0) return null;

  // Match by exact ID or substring
  const byId = orders.find(
    (o) => o.id.toLowerCase() === clean || o.id.toLowerCase().includes(clean)
  );
  if (byId) return byId;

  // Match by phone digits
  const queryDigits = clean.replace(/\D/g, '');
  if (queryDigits.length >= 4) {
    const byPhone = orders.find((o) => {
      const phoneDigits = (o.customerPhone || '').replace(/\D/g, '');
      return phoneDigits.includes(queryDigits) || queryDigits.includes(phoneDigits);
    });
    if (byPhone) return byPhone;
  }

  return null;
};

/**
 * Syncs an order created on Petalorah to Google Sheets via Webhook.
 */
export const syncOrderToGoogleSheets = async (
  order: LoggedOrder,
  webhookUrl: string
): Promise<boolean> => {
  if (!webhookUrl || !isGoogleAppsScriptUrl(webhookUrl)) return false;

  try {
    const payload = formatOrderForGoogleSheet(order);
    await fetch(webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error('Failed to sync order to Google Sheets:', error);
    return false;
  }
};

export const syncBatchOrdersToGoogleSheets = async (
  orders: LoggedOrder[],
  webhookUrl: string
): Promise<{ success: number; total: number }> => {
  if (!webhookUrl || !isGoogleAppsScriptUrl(webhookUrl)) {
    return { success: 0, total: orders.length };
  }

  let count = 0;
  for (const order of orders) {
    const ok = await syncOrderToGoogleSheets(order, webhookUrl);
    if (ok) count++;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return { success: count, total: orders.length };
};

/**
 * Tests connection to the provided Google Sheet or Webhook.
 */
export const testGoogleSheetsConnection = async (
  urlOrId: string
): Promise<{ success: boolean; message: string; count?: number }> => {
  if (!urlOrId || !urlOrId.trim()) {
    return { success: false, message: 'Please enter a Google Sheet link or Apps Script URL.' };
  }

  const trimmed = urlOrId.trim();

  // 1. Direct Google Sheet test
  if (isDirectGoogleSheetUrl(trimmed)) {
    try {
      const orders = await fetchOrdersFromGoogleSheet(trimmed);
      return {
        success: true,
        message: `Successfully connected to Google Sheet! Found ${orders.length} orders ready for tracking.`,
        count: orders.length,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Could not read Google Sheet. Please make sure the sheet is set to "Anyone with the link can view" in Google Drive sharing settings.`,
      };
    }
  }

  // 2. Google Apps Script Web App test
  if (isGoogleAppsScriptUrl(trimmed)) {
    try {
      // Test GET first
      const orders = await fetchOrdersFromGoogleSheet(trimmed);
      if (orders.length > 0) {
        return {
          success: true,
          message: `Connected to Web App! Retrieved ${orders.length} orders from the sheet.`,
          count: orders.length,
        };
      }

      // If GET returned empty, try ping via POST
      await fetch(trimmed, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping' }),
      });

      return {
        success: true,
        message: 'Connection ping sent to Google Apps Script Web App successfully!',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Failed to connect. Ensure your Apps Script Web App is deployed with "Anyone" access.',
      };
    }
  }

  return {
    success: false,
    message: 'Unrecognized URL. Please provide a Google Sheet link (docs.google.com/spreadsheets/...) or an Apps Script URL.',
  };
};

/**
 * Modern Google Apps Script code with both doGet (read/search orders) and doPost (save orders).
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Petalorah & Accounts App Google Sheets Bridge
 * Supports both writing new orders (doPost) and live order tracking queries (doGet).
 */

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', orders: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0].map(function(h) { return String(h).toLowerCase().trim(); });
    var rows = data.slice(1);
    
    var findCol = function(pattern) {
      for (var i = 0; i < headers.length; i++) {
        if (pattern.test(headers[i])) return i;
      }
      return -1;
    };
    
    var idCol = findCol(/order\\s*id|order_id|^id$|invoice|bill/i);
    var dateCol = findCol(/date|time|created/i);
    var nameCol = findCol(/customer|name|client|party/i);
    var phoneCol = findCol(/phone|mobile|contact/i);
    var itemsCol = findCol(/item|product|description|summary/i);
    var totalItemsCol = findCol(/total\\s*items|qty|quantity/i);
    var amountCol = findCol(/total\\s*amount|amount|total|price/i);
    var channelCol = findCol(/channel|source/i);
    var statusCol = findCol(/status/i);
    var courierCol = findCol(/courier|carrier/i);
    var trackingCol = findCol(/tracking|awb/i);
    
    var query = (e && e.parameter && (e.parameter.orderId || e.parameter.q || '')) ? String(e.parameter.orderId || e.parameter.q).toLowerCase().trim() : '';
    
    var orders = [];
    
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var orderId = idCol !== -1 ? String(row[idCol] || '').trim() : String(row[0] || '').trim();
      if (!orderId || orderId.toLowerCase() === 'order id') continue;
      
      var phone = phoneCol !== -1 ? String(row[phoneCol] || '').trim() : '';
      
      // Filter if query is provided
      if (query) {
        var idMatches = orderId.toLowerCase().indexOf(query) !== -1;
        var phoneMatches = phone && phone.replace(/\\D/g, '').indexOf(query.replace(/\\D/g, '')) !== -1;
        if (!idMatches && !phoneMatches) continue;
      }
      
      var amount = amountCol !== -1 ? parseFloat(String(row[amountCol]).replace(/[^0-9.]/g, '')) || 0 : 0;
      var totalItems = totalItemsCol !== -1 ? parseInt(String(row[totalItemsCol]).replace(/\\D/g, ''), 10) || 1 : 1;
      var status = statusCol !== -1 ? String(row[statusCol] || 'New').trim() : 'New';
      var courier = courierCol !== -1 ? String(row[courierCol] || '').trim() : '';
      var tracking = trackingCol !== -1 ? String(row[trackingCol] || '').trim() : '';
      var itemsSummary = itemsCol !== -1 ? String(row[itemsCol] || '').trim() : 'Handcrafted Order';
      var createdAt = dateCol !== -1 && row[dateCol] ? new Date(row[dateCol]).toISOString() : new Date().toISOString();
      
      orders.push({
        id: orderId,
        createdAt: createdAt,
        customerName: nameCol !== -1 ? String(row[nameCol] || 'Customer').trim() : 'Customer',
        customerPhone: phone,
        itemsSummary: itemsSummary,
        totalItems: totalItems,
        totalAmount: amount,
        channel: channelCol !== -1 ? String(row[channelCol] || 'WhatsApp').trim() : 'WhatsApp',
        status: status,
        courierPartner: courier,
        trackingNumber: tracking,
        estimatedDelivery: 'Estimated 3-5 business days'
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', orders: orders }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Order ID',
        'Date & Time',
        'Customer Name',
        'Customer Phone',
        'Items Summary',
        'Total Items',
        'Total Amount (₹)',
        'Order Channel',
        'Status',
        'Courier Partner',
        'Tracking AWB'
      ]);
      sheet.getRange('A1:K1').setFontWeight('bold').setBackground('#FCE7F3');
    }
    
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Connected successfully!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    sheet.appendRow([
      data.orderId,
      data.createdAt,
      data.customerName || 'Customer',
      data.customerPhone || '',
      data.itemsSummary || '',
      data.totalItems || 0,
      data.totalAmount || 0,
      data.channel || '',
      data.status || 'New',
      data.courierPartner || '',
      data.trackingNumber || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
