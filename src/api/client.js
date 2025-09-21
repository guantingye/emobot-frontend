// src/api/client.js
import { useState, useEffect, useRef } from 'react';

const API_BASE = "https://emobot-backend.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatError(data, status) {
  if (!data) return `HTTP ${status}`;
  if (Array.isArray(data.detail)) {
    const messages = data.detail.map(err => {
      const field = Array.isArray(err.loc) ? err.loc.join('.') : 'field';
      return `${field}: ${err.msg}`;
    });
    return `驗證錯誤: ${messages.join(', ')}`;
  }
  if (typeof data.detail === "string") return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;
  return `HTTP ${status}`;
}

async function request(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}${path}`;

  let { method = "GET", headers = {}, body, retries = 2 } = options;

  if (body != null && typeof body !== "string") {
    body = JSON.stringify(body);
  }
  const httpMethod = method.toUpperCase();
  if (!body && ["POST", "PUT", "PATCH"].includes(httpMethod)) {
    body = "{}";
  }

  const finalHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...authHeader(),
    ...headers,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: httpMethod,
        headers: finalHeaders,
        body: body || undefined,
        credentials: 'omit',   // ★ 改為不帶 Cookie（降低 CORS 約束）
        mode: 'cors',          // ★ 指定 CORS 模式
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = formatError(errorData, response.status);
        throw new Error(errorMessage);
      }
    } catch (error) {
      if (attempt === retries) {
        if (error.name === 'TypeError' && String(error.message).includes('fetch')) {
          throw new Error(`無法連接到伺服器，請檢查：
1. 伺服器離線或重啟中
2. 網路連線問題
3. CORS 設定問題
請稍後再試或聯繫管理員。`);
        }
        throw error;
      }
    }
  }
}

// ====== 基本 API ======
export async function testConnection() { return await request("/api/health"); }

export async function apiJoin(pid, nickname) {
  const result = await request("/api/auth/join", {
    method: "POST",
    body: { pid, nickname },
  });
  if (result?.token) localStorage.setItem("token", result.token);
  if (result?.user) localStorage.setItem("user", JSON.stringify(result.user));
  return result;
}

export async function apiMe() { return await request("/api/user/profile"); }

// ====== 測評相關 ======
export async function saveAssessment(data) {
  const processedData = { ...data, submittedAt: data.submittedAt || new Date().toISOString() };
  if (data.mbti && typeof data.mbti === 'object') {
    processedData.mbti_raw = data.mbti.raw;
    processedData.mbti_encoded = data.mbti.encoded;
    delete processedData.mbti;
  }
  return await request("/api/assessments/upsert", { method: "POST", body: processedData });
}

export async function saveAssessmentMBTI(mbtiString, encodedArray) {
  const mbti_raw = String(mbtiString).toUpperCase();
  const mbti_encoded = Array.isArray(encodedArray) ? encodedArray.map(v => parseFloat(v) || 0) : [0,0,0,0];
  return await request("/api/assessments/upsert", { method: "POST", body: { mbti_raw, mbti_encoded } });
}

export async function runMatching() { return await request("/api/match/recommend", { method: "POST" }); }
export async function commitChoice(botType) { return await request("/api/match/choose", { method: "POST", body: { bot_type: botType } }); }

// ====== 聊天相關 ======
export async function sendChatMessage(message, botType = "solution", mode = "text", history = []) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || 0;
  return await request("/api/chat/send", {
    method: "POST",
    headers: { "X-User-Id": String(userId) },
    body: { message, bot_type: botType, mode, history, demo: false },
  });
}

// 產生本地 lipsync 影片
export async function generateUtterVideo({ text, imageUrl, voice = null, mouthBox = null, fps = 30 }) {
  return await request("/api/av/utter", {
    method: "POST",
    body: { text, image_url: imageUrl || null, voice, mouth_box: mouthBox, fps },
  });
}

// ====== 舊版相容 ======
export async function saveChatMessage(content, role = "user", botType = null, userMood = null, moodIntensity = null) {
  return await request("/api/chat/messages", {
    method: "POST",
    body: { content, role, bot_type: botType, mode: "text", user_mood: userMood, mood_intensity: moodIntensity },
  });
}
export async function getChatHistory(limit = 50) { return await request(`/api/chat/messages?limit=${limit}`); }

// ====== 心情記錄 ======
export async function saveMoodRecord(mood, intensity, note = null) {
  return await request("/api/mood/records", { method: "POST", body: { mood, intensity, note } });
}
export async function getMoodHistory(days = 30) { return await request(`/api/mood/records?days=${days}`); }

// ====== 會話管理 ======
export async function endChatSession(reason = "user_ended") {
  return await request("/api/chat/session/end", { method: "POST", body: { reason } });
}
export async function getChatSessions(activeOnly = false) { return await request(`/api/admin/chat-sessions?active_only=${activeOnly}`); }
export async function cleanupInactiveSessions(timeoutMinutes = 5) {
  return await request(`/api/admin/chat-sessions/cleanup?timeout_minutes=${timeoutMinutes}`, { method: "POST" });
}

// ====== PID 管理 ======
export async function getAllowedPids(activeOnly = true) { return await request(`/api/admin/allowed-pids?active_only=${activeOnly}`); }
export async function createAllowedPid(pid, description = null) {
  return await request("/api/admin/allowed-pids", { method: "POST", body: { pid, description } });
}
export async function updateAllowedPid(pidId, updates) {
  return await request(`/api/admin/allowed-pids/${pidId}`, { method: "PUT", body: updates });
}
export async function deleteAllowedPid(pidId) { return await request(`/api/admin/allowed-pids/${pidId}`, { method: "DELETE" }); }

// ====== 統計 ======
export async function getSystemStatistics() { return await request("/api/admin/statistics"); }

// ====== 其他 ======
export async function getMyAssessment() { return await request("/api/assessments/me"); }
export async function getMyMatchChoice() { return await request("/api/match/me"); }
export async function debugDbTest() { return await request("/api/debug/db-test"); }

// ====== 會話管理 Hook ======
export function useSessionManager() {
  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const timeoutRef = useRef(null);

  const TIMEOUT_MINUTES = 5;
  const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;

  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { handleSessionTimeout(); }, TIMEOUT_MS);
  };

  const handleSessionTimeout = async () => {
    if (isActive) {
      try {
        await endChatSession("timeout");
        setIsActive(false);
        setSessionId(null);
      } catch (error) {
        console.error("自動結束會話失敗:", error);
      }
    }
  };

  const startSession = (newSessionId) => { setSessionId(newSessionId); setIsActive(true); updateActivity(); };
  const endSession = async (reason = "user_ended") => {
    if (isActive) {
      try {
        await endChatSession(reason);
        setIsActive(false);
        setSessionId(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } catch (error) {
        console.error("結束會話失敗:", error);
      }
    }
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return { sessionId, isActive, startSession, endSession, updateActivity, timeoutMinutes: TIMEOUT_MINUTES };
}

const apiClient = {
  testConnection,
  apiJoin,
  apiMe,
  saveAssessment,
  saveAssessmentMBTI,
  runMatching,
  commitChoice,
  sendChatMessage,
  generateUtterVideo,
  saveChatMessage,
  getChatHistory,
  saveMoodRecord,
  getMoodHistory,
  getMyAssessment,
  getMyMatchChoice,
  debugDbTest,
  endChatSession,
  getChatSessions,
  cleanupInactiveSessions,
  getAllowedPids,
  createAllowedPid,
  updateAllowedPid,
  deleteAllowedPid,
  getSystemStatistics,
  useSessionManager,
};

export default apiClient;
