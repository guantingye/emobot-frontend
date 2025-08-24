// src/api/client.js
// 簡化版本 - 專注於核心功能和錯誤處理

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "https://emobot-backend.onrender.com";

console.log("API_BASE:", API_BASE);

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 統一的錯誤處理
function formatError(data, status) {
  if (!data) return `HTTP ${status}`;
  
  // FastAPI 驗證錯誤
  if (Array.isArray(data.detail)) {
    const messages = data.detail.map(err => {
      const field = Array.isArray(err.loc) ? err.loc.join('.') : 'field';
      return `${field}: ${err.msg}`;
    });
    return `驗證錯誤: ${messages.join(', ')}`;
  }
  
  // 一般錯誤
  if (typeof data.detail === "string") return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;
  
  return `HTTP ${status}`;
}

async function request(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}${path}`;

  let { method = "GET", headers = {}, body } = options;

  // 處理 body 格式
  if (body != null && typeof body !== "string") {
    body = JSON.stringify(body);
  }

  // 如果是 POST/PUT/PATCH 但沒有 body，傳送空物件
  const httpMethod = method.toUpperCase();
  if (!body && ["POST", "PUT", "PATCH"].includes(httpMethod)) {
    body = "{}";
  }

  const finalHeaders = {
    "Accept": "application/json",
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...authHeader(),
    ...headers,
  };

  console.log(`🌐 ${httpMethod} ${url}`);
  if (body) console.log("📤 Request body:", body.substring(0, 200) + (body.length > 200 ? "..." : ""));

  try {
    const resp = await fetch(url, { 
      method: httpMethod, 
      headers: finalHeaders, 
      body 
    });

    console.log(`📥 Response: ${resp.status} ${resp.statusText}`);

    // 解析回應
    let data;
    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await resp.json();
    } else {
      data = await resp.text();
    }

    if (data && typeof data === 'object') {
      console.log("📋 Response data:", data);
    }

    // 錯誤處理
    if (!resp.ok) {
      const errorMessage = formatError(data, resp.status);
      console.error("❌ Request failed:", errorMessage);
      const error = new Error(errorMessage);
      error.status = resp.status;
      error.data = data;
      throw error;
    }

    return data;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error("🌐 Network error:", error.message);
      throw new Error("網路連線失敗，請檢查網路連線或稍後再試");
    }
    throw error;
  }
}

// ====== 核心 API 函數 ======

export async function apiJoin(pid, nickname) {
  try {
    const result = await request("/api/auth/join", {
      method: "POST",
      body: { pid, nickname },
    });
    
    // 儲存認證資訊
    if (result?.token) {
      localStorage.setItem("token", result.token);
      console.log("✅ Token saved");
    }
    if (result?.user) {
      localStorage.setItem("user", JSON.stringify(result.user));
      console.log("✅ User data saved");
    }
    
    return result;
  } catch (error) {
    console.error("❌ Join failed:", error.message);
    throw error;
  }
}

export async function apiMe() {
  try {
    return await request("/api/user/profile", {
      method: "GET",
    });
  } catch (error) {
    console.error("❌ Get profile failed:", error.message);
    throw error;
  }
}

// 統一的評估儲存函數
export async function saveAssessment(data) {
  try {
    console.log("💾 Saving assessment:", data);
    
    const result = await request("/api/assessments/upsert", {
      method: "POST",
      body: {
        ...data,
        submittedAt: data.submittedAt || new Date().toISOString()
      },
    });
    
    console.log("✅ Assessment saved:", result);
    return result;
  } catch (error) {
    console.error("❌ Save assessment failed:", error.message);
    throw error;
  }
}

// 專門用於 MBTI 的儲存函數 - 使用專用 API
export async function saveAssessmentMBTI(mbti, encoded) {
  console.log("💾 Saving MBTI:", { mbti, encoded });
  
  try {
    const result = await request("/api/assessments/mbti", {
      method: "POST",
      body: {
        mbti_raw: String(mbti).toUpperCase(),
        mbti_encoded: encoded
      },
    });
    
    console.log("✅ MBTI saved successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ MBTI save failed:", error.message);
    throw error;
  }
}

export async function runMatching() {
  try {
    console.log("🤖 Running matching algorithm...");
    return await request("/api/match/recommend", {
      method: "POST",
    });
  } catch (error) {
    console.error("❌ Matching failed:", error.message);
    throw error;
  }
}

export async function commitChoice(botType) {
  try {
    console.log("🎯 Committing bot choice:", botType);
    return await request("/api/match/choose", {
      method: "POST",
      body: { botType },
    });
  } catch (error) {
    console.error("❌ Commit choice failed:", error.message);
    throw error;
  }
}

export async function testConnection() {
  try {
    return await request("/api/health");
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    throw error;
  }
}

// 聊天相關 API
export async function saveChatMessage(content, messageType = "user", botType = null, userMood = null, moodIntensity = null) {
  try {
    return await request("/api/chat/messages", {
      method: "POST",
      body: {
        content,
        message_type: messageType,
        bot_type: botType,
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

// 心情記錄 API
export async function saveMoodRecord(mood, intensity, note = null) {
  try {
    return await request("/api/mood/records", {
      method: "POST",
      body: { mood, intensity, note },
    });
  } catch (error) {
    console.error("❌ Save mood record failed:", error.message);
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

// 向後相容的 API
export async function getMyAssessment() {
  try {
    return await request("/api/assessments/me");
  } catch (error) {
    console.error("❌ Get my assessment failed:", error.message);
    throw error;
  }
}

export async function getMyMatchChoice() {
  try {
    return await request("/api/match/me");
  } catch (error) {
    console.error("❌ Get my match choice failed:", error.message);
    throw error;
  }
}

// 除錯 API
export async function debugDbTest() {
  try {
    return await request("/api/debug/db-test");
  } catch (error) {
    console.error("❌ DB test failed:", error.message);
    throw error;
  }
}

// 預設匯出
export default {
  apiJoin,
  apiMe,
  saveAssessment,
  saveAssessmentMBTI,
  runMatching,
  commitChoice,
  testConnection,
  saveChatMessage,
  getChatHistory,
  saveMoodRecord,
  getMoodHistory,
  getMyAssessment,
  getMyMatchChoice,
  debugDbTest,
};