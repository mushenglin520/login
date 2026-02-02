import React, { useState } from 'react';

const SHEET_ID = '1svVvbCQp2cIQSNur0t0JF4U0FCJu4hsYgiLgo8lWFdU';

const CODE_GS = `// Code.gs - 後端邏輯 (API 版本)

// Google Sheet ID
const SHEET_ID = "${SHEET_ID}";

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
`;

export const GasCodeViewer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_GS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">後端程式碼 (Code.gs)</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-4 bg-yellow-50 border-b border-yellow-100 text-sm text-yellow-800">
          <strong>⚠️ 重要提示：</strong> 
          為了讓部署在 Vercel 或 Github 的前端能順利連線，您必須將 Google Apps Script 更新為下方的 <strong>API 版本</strong>。
          <br />
          更新後請記得點選 GAS 編輯器中的「部署」&gt;「管理部署」&gt; 點選鉛筆圖示 &gt; 版本選擇「新版本」&gt;「部署」。
        </div>

        <div className="flex-1 overflow-auto bg-[#1e1e1e] text-gray-300 p-4 font-mono text-sm relative group">
          <button 
            onClick={handleCopy}
            className="absolute top-4 right-4 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition border border-white/20"
          >
            {copied ? '已複製！' : '複製程式碼'}
          </button>
          <pre className="whitespace-pre-wrap">
            <code>{CODE_GS}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};