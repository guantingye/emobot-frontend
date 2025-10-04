// src/api/client.js - 清理版本（已移除 HeyGen/DID 視訊功能）

function getApiBaseUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE || 'https://emobot-backend.onrender.com';
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_BASE || process.env.VITE_API_BASE || 'https://emobot-backend.onrender.com';
  }
  
  if (typeof window !== 'undefined' && window.VITE_API_BASE) {
    return window.VITE_API_BASE;
  }
  
  return 'https://emobot-backend.onrender.com';
}

const BASE_URL = getApiBaseUrl();

// ============================================================================
// 輔助函數
// ============================================================================

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

export async function apiJoin(pid, nickname) {
  const response = await fetch(`${BASE_URL}/api/auth/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pid, nickname }),
  });
  return handleResponse(response);
}

export async function apiMe() {
  const response = await fetch(`${BASE_URL}/api/user/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ============================================================================
// 心理測驗相關 API
// ============================================================================

export async function saveAssessmentMBTI(mbtiString, mbtiEncoded) {
  const response = await fetch(`${BASE_URL}/api/assessments/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      mbti_raw: mbtiString,
      mbti_encoded: mbtiEncoded,
      is_retest: localStorage.getItem('isRetest') === 'true'
    }),
  });
  
  return handleResponse(response);
}

export async function saveAssessment(payload) {
  const requestBody = {
    mbti_raw: payload.mbti_raw || payload.mbtiRaw || null,
    mbti_encoded: payload.mbti_encoded || payload.mbtiEncoded || null,
    step2_answers: payload.step2_answers || payload.step2Answers || null,
    step3_answers: payload.step3_answers || payload.step3Answers || null,
    step4_answers: payload.step4_answers || payload.step4Answers || null,
    ai_preference: payload.ai_preference || payload.aiPreference || null,
    submittedAt: payload.submittedAt || null,
    is_retest: payload.is_retest || localStorage.getItem('isRetest') === 'true'
  };
  
  const response = await fetch(`${BASE_URL}/api/assessments/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });
  
  return handleResponse(response);
}

export async function apiUpsertAssessment(payload) {
  return saveAssessment(payload);
}

export async function apiGetMyAssessment() {
  const response = await fetch(`${BASE_URL}/api/assessments/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function apiGetAssessmentHistory(limit = 10) {
  const response = await fetch(
    `${BASE_URL}/api/assessments/history?limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function apiGetAssessmentById(assessmentId) {
  const response = await fetch(
    `${BASE_URL}/api/assessments/${assessmentId}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

// ============================================================================
// 機器人推薦相關 API
// ============================================================================

export async function apiRecommend() {
  const response = await fetch(`${BASE_URL}/api/match/recommend`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function runMatching() {
  return apiRecommend();
}

export async function apiChooseBot(botType) {
  const response = await fetch(`${BASE_URL}/api/match/choose`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bot_type: botType }),
  });
  return handleResponse(response);
}

export async function commitChoice(botType) {
  return apiChooseBot(botType);
}

// ============================================================================
// 聊天相關 API
// ============================================================================

export async function sendChatMessage(
  message, 
  botType = 'solution', 
  history = [], 
  demo = false
) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message,
        bot_type: botType,
        history,
        demo,
      }),
    });

    return await handleResponse(response);
    
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}

export const apiSendChat = sendChatMessage;

export async function apiGetChatHistory(limit = 50) {
  const response = await fetch(`${BASE_URL}/api/chat/history?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function apiGetChatStats() {
  const response = await fetch(`${BASE_URL}/api/chat/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function checkFirstTimeChat(botType) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/first-time-check/${botType}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Check first time chat error:', error);
    return { ok: false, is_first_time: false };
  }
}

// ============================================================================
// 心情記錄相關 API
// ============================================================================

export async function apiSaveMood(score, note = '', tags = []) {
  const response = await fetch(`${BASE_URL}/api/moods`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ score, note, tags }),
  });
  return handleResponse(response);
}

export async function apiGetMyMoods(limit = 30) {
  const response = await fetch(`${BASE_URL}/api/moods/me?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function apiGetMoodAnalysis(days = 30) {
  const response = await fetch(`${BASE_URL}/api/mood/analysis?days=${days}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ============================================================================
// 管理員相關 API
// ============================================================================

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

export async function createAllowedPid(pid, description = '') {
  const response = await fetch(`${BASE_URL}/api/admin/allowed-pids`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ pid, description }),
  });
  return handleResponse(response);
}

export const apiAddAllowedPid = createAllowedPid;

export async function updateAllowedPid(pidId, data) {
  const response = await fetch(`${BASE_URL}/api/admin/allowed-pids/${pidId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteAllowedPid(pidId) {
  const response = await fetch(`${BASE_URL}/api/admin/allowed-pids/${pidId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export const apiDeleteAllowedPid = deleteAllowedPid;

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

export async function getSystemStatistics() {
  const response = await fetch(`${BASE_URL}/api/admin/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ============================================================================
// 預設導出
// ============================================================================

export default {
  apiJoin,
  apiMe,
  saveAssessmentMBTI,
  saveAssessment,
  apiUpsertAssessment,
  apiGetMyAssessment,
  apiGetAssessmentHistory,
  apiGetAssessmentById,
  apiRecommend,
  runMatching,
  apiChooseBot,
  commitChoice,
  sendChatMessage,
  apiSendChat,
  apiGetChatHistory,
  apiGetChatStats,
  checkFirstTimeChat,
  apiSaveMood,
  apiGetMyMoods,
  apiGetMoodAnalysis,
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