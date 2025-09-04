// src/components/RouteProtection.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiMe } from '../api/client';

export const ProtectedRoute = ({ children, requiredStage = null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const status = await apiMe();
      setUserStatus(status);

      // 根據用戶狀態和當前頁面要求進行路由
      if (requiredStage && status.user_flow_stage !== requiredStage) {
        // 用戶不在正確的流程階段，重定向到正確頁面
        navigate(status.next_route);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('User status check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Noto Sans TC, sans-serif'
      }}>
        <div>載入中...</div>
      </div>
    );
  }

  return children;
};

// 使用範例：
// <ProtectedRoute requiredStage="new">
//   <TestPage />
// </ProtectedRoute>

// <ProtectedRoute requiredStage="active">
//   <ChatPage />
// </ProtectedRoute>

// 或者在 App.jsx 中統一處理路由邏輯
export const SmartRouteHandler = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    handleRouting();
  }, []);

  const handleRouting = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const status = await apiMe();
      
      // 根據用戶流程階段自動導向正確頁面
      const currentPath = window.location.pathname;
      const shouldRedirect = 
        (currentPath === '/test' && status.user_flow_stage !== 'new') ||
        (currentPath === '/matching' && status.user_flow_stage !== 'assessed') ||
        (currentPath === '/choose-bot' && status.user_flow_stage !== 'recommended') ||
        (currentPath === '/dashboard' && status.user_flow_stage !== 'active');

      if (shouldRedirect) {
        navigate(status.next_route);
        return;
      }

      setChecking(false);
    } catch (error) {
      console.error('Route handling failed:', error);
      navigate('/login');
    }
  };

  if (checking) {
    return <div>檢查用戶狀態中...</div>;
  }

  return children;
};