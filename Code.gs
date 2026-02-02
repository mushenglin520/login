// Code.gs - 後端邏輯 (API 版本)

// Google Sheet ID
const SHEET_ID = "1svVvbCQp2cIQSNur0t0JF4U0FCJu4hsYgiLgo8lWFdU";

/**
 * 處理 POST 請求 (API 接口)
 * 當外部網站 (如 Vercel) 呼叫時，會觸發此函式
 */
function doPost(e) {
  // 建立鎖定以避免並發寫入衝突 (Optional but recommended)
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // 解析傳入的 JSON 資料
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    let result = {};

    if (action === 'register') {
      result = registerUser(params.username, params.password);
    } else if (action === 'login') {
      result = loginUser(params.username, params.password);
    } else {
      result = { success: false, message: '無效的操作' };
    }

    // 回傳 JSON 結果
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      message: '伺服器錯誤: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("API is running. Please use POST method.");
}

/**
 * 處理註冊
 */
function registerUser(username, password) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheets()[0]; 
  
  const data = sheet.getDataRange().getValues();
  
  // 檢查帳號是否存在
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == username) {
      return { success: false, message: '帳號已存在' };
    }
  }
  
  // 寫入資料
  sheet.appendRow([username, password, new Date()]);
  return { success: true, message: '註冊成功' };
}

/**
 * 處理登入
 */
function loginUser(username, password) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == username && data[i][1] == password) {
      return { success: true, message: '登入成功' };
    }
  }
  
  return { success: false, message: '帳號密碼錯誤' };
}
