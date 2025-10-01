// src/api/client.js - 完整版本

// 安全地取得 API Base URL
function getApiBaseUrl() {
  // 方法1: 檢查 import.meta (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE || 'https://emobot-backend.onrender.com';
  }
  
  // 方法2: 檢查 process.env (Webpack/CRA)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_BASE || process.env.VITE_API_BASE || 'https://emobot-backend.onrender.com';
  }
  
  // 方法3: 檢查 window 全局變數
  if (typeof window !== 'undefined' && window.VITE_API_BASE) {
    return window.VITE_API_BASE;
  }
  
  // 預設值
  return 'https://emobot-backend.onrender.com';
}

const BASE_URL = getApiBaseUrl();

// ============================================================================
// 輔助函數
// ============================================================================

/**
 * 取得認證 headers
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * 處理 API 回應
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '請求失敗' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

// ============================================================================
// 認證相關 API
// ============================================================================

/**
 * 登入/註冊
 */
export async function apiJoin(pid, nickname) {
  const response = await fetch(`${BASE_URL}/api/auth/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pid, nickname }),
  });
  return handleResponse(response);
}

/**
 * 取得用戶資料
 */
export async function apiMe() {
  const response = await fetch(`${BASE_URL}/api/user/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ============================================================================
// 心理測驗相關 API
// ============================================================================

/**
 * 儲存/更新測驗結果
 */
export async function apiUpsertAssessment(payload) {
  const response = await fetch(`${BASE_URL}/api/assessments/upsert`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * 取得我的測驗結果
 */
export async function apiGetMyAssessment() {
  const response = await fetch(`${BASE_URL}/api/assessments/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ============================================================================
// 機器人推薦相關 API
// ============================================================================

/**
 * 執行推薦演算法
 */
export async function apiRecommend() {
  const response = await fetch(`${BASE_URL}/api/match/recommend`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * 執行推薦演算法 (別名,為了向後兼容)
 */
export async function runMatching() {
  return apiRecommend();
}

/**
 * 選擇機器人
 */
export async function apiChooseBot(botType) {
  const response = await fetch(`${BASE_URL}/api/match/choose`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bot_type: botType }),
  });
  return handleResponse(response);
}

/**
 * 選擇機器人 (別名,為了向後兼容)
 */
export async function commitChoice(botType) {
  return apiChooseBot(botType);
}

// ============================================================================
// 聊天相關 API
// ============================================================================

/**
 * 發送聊天訊息
 * @param {string} message - 用戶訊息內容
 * @param {string} botType - 機器人類型 (empathy/insight/solution/cognitive)
 * @param {string} mode - 對話模式 (text/video)
 * @param {Array} history - 對話歷史記錄
 * @param {boolean} demo - 是否為演示模式
 * @param {string} sessionId - HeyGen 會話 ID (video 模式使用)
 */
export async function sendChatMessage(
  message, 
  botType = 'solution', 
  mode = 'text', 
  history = [], 
  demo = false,
  sessionId = null
) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/send`, {
      method: 'POST',
      headers: getAuthHeaders(), // 使用 JWT Bearer token
      body: JSON.stringify({
        message,
        bot_type: botType,
        mode,
        history,
        demo,
        session_id: sessionId,
      }),
    });

    return await handleResponse(response);
    
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}

/**
 * 取得聊天歷史記錄
 */
export async function apiGetChatHistory(limit = 50) {
  const response = await fetch(`${BASE_URL}/api/chat/history?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * 取得聊天統計資訊
 */
export async function apiGetChatStats() {
  const response = await fetch(`${BASE_URL}/api/chat/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ============================================================================
// HeyGen 視訊相關 API
// ============================================================================

/**
 * 創建 HeyGen 會話
 */
export async function apiCreateHeyGenSession(avatarId = null, voice = null) {
  const response = await fetch(`${BASE_URL}/api/chat/heygen/create_session`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      avatar_id: avatarId,
      voice: voice,
      quality: 'medium',
      language: 'zh-TW',
    }),
  });
  return handleResponse(response);
}

/**
 * 發送文字到 HeyGen
 */
export async function apiSendTextToHeyGen(sessionId, text, emotion = 'friendly', rate = 1.0) {
  const response = await fetch(`${BASE_URL}/api/chat/heygen/send_text`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      session_id: sessionId,
      text,
      emotion,
      rate,
    }),
  });
  return handleResponse(response);
}

/**
 * 關閉 HeyGen 會話
 */
export async function apiCloseHeyGenSession(sessionId) {
  const response = await fetch(`${BASE_URL}/api/chat/heygen/close_session`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ session_id: sessionId }),
  });
  return handleResponse(response);
}

// ============================================================================
// 心情記錄相關 API
// ============================================================================

/**
 * 儲存心情記錄
 */
export async function apiSaveMood(score, note = '', tags = []) {
  const response = await fetch(`${BASE_URL}/api/moods`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ score, note, tags }),
  });
  return handleResponse(response);
}

/**
 * 取得我的心情記錄
 */
export async function apiGetMyMoods(limit = 30) {
  const response = await fetch(`${BASE_URL}/api/moods/me?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ============================================================================
// 管理員相關 API
// ============================================================================

/**
 * 取得允許的 PID 清單
 */
export async function getAllowedPids(activeOnly = true) {
  const response = await fetch(
    `${BASE_URL}/api/admin/allowed-pids${activeOnly ? '?active_only=true' : ''}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

/**
 * 新增允許的 PID
 */
export async function createAllowedPid(pid, description = '') {
  const response = await fetch(`${BASE_URL}/api/admin/allowed-pids`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ pid, description }),
  });
  return handleResponse(response);
}

/**
 * 更新允許的 PID
 */
export async function updateAllowedPid(pidId, data) {
  const response = await fetch(`${BASE_URL}/api/admin/allowed-pids/${pidId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * 刪除允許的 PID
 */
export async function deleteAllowedPid(pidId) {
  const response = await fetch(`${BASE_URL}/api/admin/allowed-pids/${pidId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * 取得聊天會話列表
 */
export async function getChatSessions(activeOnly = true) {
  const response = await fetch(
    `${BASE_URL}/api/admin/chat-sessions${activeOnly ? '?active_only=true' : ''}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

/**
 * 清理非活躍會話
 */
export async function cleanupInactiveSessions(timeoutMinutes = 30) {
  const response = await fetch(
    `${BASE_URL}/api/admin/cleanup-sessions?timeout_minutes=${timeoutMinutes}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

/**
 * 取得系統統計資訊
 */
export async function getSystemStatistics() {
  const response = await fetch(`${BASE_URL}/api/admin/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ============================================================================
// 向後兼容的別名
// ============================================================================

// 為了兼容舊代碼,提供一些別名
export const apiSendChat = sendChatMessage;
export const apiAddAllowedPid = createAllowedPid;
export const apiDeleteAllowedPid = deleteAllowedPid;

// 測驗相關的別名
export const saveAssessmentMBTI = apiUpsertAssessment;
export const saveAssessment = apiUpsertAssessment;

// ============================================================================
// 預設導出
// ============================================================================

export default {
  // 認證
  apiJoin,
  apiMe,
  
  // 測驗
  apiUpsertAssessment,
  apiGetMyAssessment,
  saveAssessmentMBTI,  // 別名
  saveAssessment,      // 別名
  
  // 推薦
  apiRecommend,
  runMatching,
  apiChooseBot,
  commitChoice,
  
  // 聊天
  sendChatMessage,
  apiSendChat,
  apiGetChatHistory,
  apiGetChatStats,
  
  // HeyGen
  apiCreateHeyGenSession,
  apiSendTextToHeyGen,
  apiCloseHeyGenSession,
  
  // 心情
  apiSaveMood,
  apiGetMyMoods,
  
  // 管理員
  getAllowedPids,
  createAllowedPid,
  apiAddAllowedPid,
  updateAllowedPid,
  deleteAllowedPid,
  apiDeleteAllowedPid,
  getChatSessions,
  cleanupInactiveSessions,
  getSystemStatistics,
};