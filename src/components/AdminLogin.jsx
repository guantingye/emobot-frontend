// frontend/src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleAdminLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'https://emobot-backend.onrender.com'}/api/admin/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_key: adminKey }),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '登入失敗');
      }
      
      const result = await response.json();
      
      // 儲存管理員 token
      localStorage.setItem('token', result.token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('user', JSON.stringify({ pid: 'ADMIN' }));
      
      navigate('/admin');
      
    } catch (err) {
      setError(err.message || '登入失敗,請稍後再試');
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
            請輸入管理員金鑰
          </p>
        </div>
        
        <div className="space-y-4">
          <input
            type="password"
            placeholder="管理員金鑰"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          />
          
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          
          <button
            onClick={handleAdminLogin}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '驗證中...' : '登入'}
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
      </div>
    </div>
  );
};

export default AdminLogin;