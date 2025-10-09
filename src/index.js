import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker 註冊配置
const swConfig = {
  onSuccess: (registration) => {
    console.log('PWA Service Worker 註冊成功');
  },
  onUpdate: (registration) => {
    console.log('PWA 有新版本可用');
  },
  onError: (error) => {
    // 降低錯誤等級，避免控制台紅字
    console.warn('Service Worker 註冊失敗（不影響系統運作）:', error.message);
  }
};

// 註冊 Service Worker（帶錯誤處理）
try {
  serviceWorkerRegistration.register(swConfig);
} catch (error) {
  console.warn('Service Worker 初始化失敗:', error.message);
}

reportWebVitals();