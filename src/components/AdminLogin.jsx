// src/components/AdminLogin.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // 檢查是否已經是管理員
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (isAdmin === 'true' || ['ADMIN', '000A', '999Z'].includes(user.pid)) {
      navigate('/admin');
    }
  }, [navigate]);
  
  const handleAdminLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 方法一：簡單密碼驗證
      if (adminKey === 'admin2025') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
        return;
      }
      
      // 方法二：檢查是否為管理員 PID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (['ADMIN', '000A', '999Z'].includes(user.pid)) {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
        return;
      }
      
      setError('管理員密碼錯誤或無管理員權限');
      
    } catch (err) {
      setError('登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleAdminLogin();
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">管理員登入</h2>
          <p className="mt-2 text-sm text-gray-600">
            請輸入管理員密碼或使用管理員 PID 登入
          </p>
        </div>
        
        <div className="space-y-4">
          <input
            type="password"
            placeholder="管理員密碼"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            onClick={handleAdminLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '登入中...' : '登入管理後台'}
          </button>
          
          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              返回一般登入
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
          <p>管理員功能包括：</p>
          <ul className="mt-2 space-y-1">
            <li>• 系統使用統計查看</li>
            <li>• PID 白名單管理</li>
            <li>• 聊天會話記錄查看</li>
            <li>• 非活躍會話清理</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;