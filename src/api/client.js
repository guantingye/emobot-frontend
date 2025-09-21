// src/api/client.js
// 簡化版本 - 專注解決 CORS 和連線問題

// ★ 修復：將所有 import 移到檔案頂部
import { useState, useEffect, useRef } from 'react';

const API_BASE = "https://emobot-backend.onrender.com"; // ★ 請替換成你的實際後端 URL

console.log("API_BASE:", API_BASE);

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 格式化錯誤訊息
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

// ★ 簡化的 request 函數
async function request(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}${path}`;

  let { method = "GET", headers = {}, body, retries = 2 } = options;

  // 準備請求體
  if (body != null && typeof body !== "string") {
    body = JSON.stringify(body);
  }
  const httpMethod = method.toUpperCase();
  if (!body && ["POST", "PUT", "PATCH"].includes(httpMethod)) {
    body = "{}";
  }

  // 準備標頭
  const finalHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...authHeader(),
    ...headers,
  };

  console.log(`🌐 ${httpMethod} ${url}`);
  if (body && body !== "{}") {
    console.log("📤 Request body:", body.substring(0, 100) + (body.length > 100 ? "..." : ""));
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: httpMethod,
        headers: finalHeaders,
        body: body || undefined,
        credentials: 'include',
      });

      console.log(`📥 Response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Success:", data);
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = formatError(errorData, response.status);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === retries) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
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
export async function testConnection() {
  try {
    const result = await request("/api/health");
    console.log("✅ Connection test passed:", result);
    return result;
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    throw error;
  }
}

export async function apiJoin(pid, nickname) {
  try {
    console.log("🔐 Attempting login:", { pid, nickname });
    const result = await request("/api/auth/join", {
      method: "POST",
      body: { pid, nickname },
    });
    
    if (result?.token) {
      localStorage.setItem("token", result.token);
      console.log("✅ Token stored");
    }
    if (result?.user) {
      localStorage.setItem("user", JSON.stringify(result.user));
      console.log("✅ User info stored:", result.user);
    }
    return result;
  } catch (error) {
    console.error("❌ Login failed:", error.message);
    throw error;
  }
}

export async function apiMe() {
  try {
    return await request("/api/user/profile");
  } catch (error) {
    console.error("❌ Get profile failed:", error.message);
    throw error;
  }
}

// ====== 測評相關 ======
export async function saveAssessment(data) {
  try {
    console.log("💾 Saving assessment:", data);
    const processedData = {
      ...data,
      submittedAt: data.submittedAt || new Date().toISOString()
    };
    
    // 處理 MBTI 格式
    if (data.mbti && typeof data.mbti === 'object') {
      processedData.mbti_raw = data.mbti.raw;
      processedData.mbti_encoded = data.mbti.encoded;
      delete processedData.mbti;
    }
    
    const result = await request("/api/assessments/upsert", {
      method: "POST",
      body: processedData,
    });
    console.log("✅ Assessment saved:", result);
    return result;
  } catch (error) {
    console.error("❌ Save assessment failed:", error.message);
    throw error;
  }
}

export async function saveAssessmentMBTI(mbtiString, encodedArray) {
  try {
    console.log("💾 Saving MBTI:", { mbtiString, encodedArray });
    
    const mbti_raw = String(mbtiString).toUpperCase();
    const mbti_encoded = Array.isArray(encodedArray) ?
      encodedArray.map(v => parseFloat(v) || 0) : 
      [0, 0, 0, 0];
    
    const result = await request("/api/assessments/upsert", {
      method: "POST",
      body: { mbti_raw, mbti_encoded },
    });
    console.log("✅ MBTI saved:", result);
    return result;
  } catch (error) {
    console.error("❌ Save MBTI failed:", error.message);
    throw error;
  }
}

export async function runMatching() {
  try {
    const result = await request("/api/match/recommend", {
      method: "POST",
    });
    console.log("✅ Matching completed:", result);
    return result;
  } catch (error) {
    console.error("❌ Matching failed:", error.message);
    throw error;
  }
}

export async function commitChoice(botType) {
  try {
    const result = await request("/api/match/choose", {
      method: "POST",
      body: { bot_type: botType },
    });
    console.log("✅ Choice committed:", result);
    return result;
  } catch (error) {
    console.error("❌ Commit choice failed:", error.message);
    throw error;
  }
}

// ====== 聊天相關 ======
export async function sendChatMessage(message, botType = "solution", mode = "text", history = []) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || 0;
    
    const result = await request("/api/chat/send", {
      method: "POST",
      headers: {
        "X-User-Id": String(userId),
      },
      body: {
        message,
        bot_type: botType,
        mode,
        history,
        demo: false
      },
    });
    
    console.log("✅ Chat sent:", { 
      ok: result.ok, 
      hasReply: !!result.reply,
      sessionId: result.session_id 
    });
    
    return result;
  } catch (error) {
    console.error("❌ Chat send failed:", error.message);
    throw error;
  }
}

// ====== 舊版聊天 API（向後相容）======
export async function saveChatMessage(content, role = "user", botType = null, userMood = null, moodIntensity = null) {
  try {
    return await request("/api/chat/messages", {
      method: "POST",
      body: {
        content,
        role,
        bot_type: botType,
        mode: "text",
        user_mood: userMood,
        mood_intensity: moodIntensity
      },
    });
  } catch (error) {
    console.error("❌ Save chat message failed:", error.message);
    throw error;
  }
}

export async function getChatHistory(limit = 50) {
  try {
    return await request(`/api/chat/messages?limit=${limit}`);
  } catch (error) {
    console.error("❌ Get chat history failed:", error.message);
    throw error;
  }
}

// ====== 心情記錄 ======
export async function saveMoodRecord(mood, intensity, note = null) {
  try {
    return await request("/api/mood/records", {
      method: "POST",
      body: { mood, intensity, note },
    });
  } catch (error) {
    console.error("❌ Save mood failed:", error.message);
    throw error;
  }
}

export async function getMoodHistory(days = 30) {
  try {
    return await request(`/api/mood/records?days=${days}`);
  } catch (error) {
    console.error("❌ Get mood history failed:", error.message);
    throw error;
  }
}

// ====== 會話管理 API ======
export async function endChatSession(reason = "user_ended") {
  try {
    return await request("/api/chat/session/end", {
      method: "POST",
      body: { reason },
    });
  } catch (error) {
    console.error("❌ End chat session failed:", error.message);
    throw error;
  }
}

export async function getChatSessions(activeOnly = false) {
  try {
    return await request(`/api/admin/chat-sessions?active_only=${activeOnly}`);
  } catch (error) {
    console.error("❌ Get chat sessions failed:", error.message);
    throw error;
  }
}

export async function cleanupInactiveSessions(timeoutMinutes = 5) {
  try {
    return await request(`/api/admin/chat-sessions/cleanup?timeout_minutes=${timeoutMinutes}`, {
      method: "POST",
    });
  } catch (error) {
    console.error("❌ Cleanup sessions failed:", error.message);
    throw error;
  }
}

// ====== PID 管理 API ======
export async function getAllowedPids(activeOnly = true) {
  try {
    return await request(`/api/admin/allowed-pids?active_only=${activeOnly}`);
  } catch (error) {
    console.error("❌ Get allowed PIDs failed:", error.message);
    throw error;
  }
}

export async function createAllowedPid(pid, description = null) {
  try {
    return await request("/api/admin/allowed-pids", {
      method: "POST",
      body: { pid, description },
    });
  } catch (error) {
    console.error("❌ Create allowed PID failed:", error.message);
    throw error;
  }
}

export async function updateAllowedPid(pidId, updates) {
  try {
    return await request(`/api/admin/allowed-pids/${pidId}`, {
      method: "PUT",
      body: updates,
    });
  } catch (error) {
    console.error("❌ Update allowed PID failed:", error.message);
    throw error;
  }
}

export async function deleteAllowedPid(pidId) {
  try {
    return await request(`/api/admin/allowed-pids/${pidId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("❌ Delete allowed PID failed:", error.message);
    throw error;
  }
}

// ====== 統計資料 API ======
export async function getSystemStatistics() {
  try {
    return await request("/api/admin/statistics");
  } catch (error) {
    console.error("❌ Get statistics failed:", error.message);
    throw error;
  }
}

// ====== 其他 API ======
export async function getMyAssessment() {
  try {
    return await request("/api/assessments/me");
  } catch (error) {
    console.error("❌ Get assessment failed:", error.message);
    throw error;
  }
}

export async function getMyMatchChoice() {
  try {
    return await request("/api/match/me");
  } catch (error) {
    console.error("❌ Get match failed:", error.message);
    throw error;
  }
}

export async function debugDbTest() {
  try {
    return await request("/api/debug/db-test");
  } catch (error) {
    console.error("❌ DB test failed:", error.message);
    throw error;
  }
}

// ====== 會話管理 Hook (React) ======
export function useSessionManager() {
  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const timeoutRef = useRef(null);

  const TIMEOUT_MINUTES = 5;
  const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;

  // 更新活動時間
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 設定新的超時
    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, TIMEOUT_MS);
  };

  // 處理會話超時
  const handleSessionTimeout = async () => {
    if (isActive) {
      try {
        await endChatSession("timeout");
        setIsActive(false);
        setSessionId(null);
        console.log("🕐 會話因超時自動結束");
      } catch (error) {
        console.error("❌ 自動結束會話失敗:", error);
      }
    }
  };

  // 開始新會話
  const startSession = (newSessionId) => {
    setSessionId(newSessionId);
    setIsActive(true);
    updateActivity();
  };

  // 手動結束會話
  const endSession = async (reason = "user_ended") => {
    if (isActive) {
      try {
        await endChatSession(reason);
        setIsActive(false);
        setSessionId(null);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        console.log(`✅ 會話已結束 (${reason})`);
      } catch (error) {
        console.error("❌ 結束會話失敗:", error);
      }
    }
  };

  // 清理
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    sessionId,
    isActive,
    startSession,
    endSession,
    updateActivity,
    timeoutMinutes: TIMEOUT_MINUTES
  };
}

// ★ 修復：預設匯出使用物件變數
const apiClient = {
  testConnection,
  apiJoin,
  apiMe,
  saveAssessment,
  saveAssessmentMBTI,
  runMatching,
  commitChoice,
  sendChatMessage,
  saveChatMessage,
  getChatHistory,
  saveMoodRecord,
  getMoodHistory,
  getMyAssessment,
  getMyMatchChoice,
  debugDbTest,
  // 新增的函數
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