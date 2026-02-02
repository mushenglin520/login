import React, { useState } from 'react';
import { AuthMode } from './types';
import { Input } from './components/Input';
import { loginUser, registerUser } from './services/authService';
import { GasCodeViewer } from './components/GasCodeViewer';

const App: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage({ text: '請輸入帳號與密碼', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === AuthMode.LOGIN) {
        const res = await loginUser(username, password);
        if (res.success) {
          setMessage({ text: res.message, type: 'success' });
          setIsLoggedIn(true);
        } else {
          setMessage({ text: res.message, type: 'error' });
        }
      } else {
        const res = await registerUser(username, password);
        if (res.success) {
          setMessage({ text: res.message, type: 'success' });
          alert('註冊成功！請登入。');
          setMode(AuthMode.LOGIN);
          setPassword('');
        } else {
          setMessage({ text: res.message, type: 'error' });
        }
      }
    } catch (err) {
      setMessage({ text: '連線錯誤，請檢查網路或 API 設定', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Navigation / Header */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowCode(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur text-gray-700 text-sm font-medium rounded-full shadow-sm hover:bg-white transition-all border border-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          更新 GAS 程式碼
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            會員系統
          </h1>
          <p className="text-gray-500 text-sm">
            已連線至 Google Sheet (GAS API)
          </p>
        </div>

        {isLoggedIn ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">登入成功</h2>
            <p className="text-gray-600 mb-6">歡迎回來，<span className="font-semibold text-blue-600">{username}</span></p>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              登出
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                className={`flex-1 py-4 text-sm font-medium transition-all duration-200 ${
                  mode === AuthMode.LOGIN
                    ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                    setMode(AuthMode.LOGIN);
                    setMessage(null);
                }}
              >
                登入
              </button>
              <button
                className={`flex-1 py-4 text-sm font-medium transition-all duration-200 ${
                  mode === AuthMode.REGISTER
                    ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                    setMode(AuthMode.REGISTER);
                    setMessage(null);
                }}
              >
                註冊
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <Input
                label="帳號"
                type="text"
                placeholder="請輸入您的帳號"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                label="密碼"
                type="password"
                placeholder="請輸入您的密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {message && (
                <div
                  className={`mb-6 p-3 rounded-lg text-sm font-medium text-center ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none ${
                  loading ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    處理中...
                  </span>
                ) : (
                  mode === AuthMode.LOGIN ? '立即登入' : '註冊帳號'
                )}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
                本系統直接連線至您部署的 Google Apps Script。<br/>
                請確保 GAS 專案已更新並部署為 Web App (Anyone)。
            </p>
        </div>
      </div>

      <GasCodeViewer isOpen={showCode} onClose={() => setShowCode(false)} />
    </div>
  );
};

export default App;