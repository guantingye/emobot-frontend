// src/api/client.js
// 修復版本 - 解決 CORS、欄位對不上與聊天函數命名

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

// 增強的錯誤處理
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

// ====== 核心 request（處理 CORS 與重試）======
async function request(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}${path}`;

  let { method = "GET", headers = {}, body, retries = 3 } = options;

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

  console.log(`🌐 ${httpMethod} ${url}`);
  if (body && body !== "{}") {
    console.log("📤 Request body:", body.substring(0, 200) + (body.length > 200 ? "..." : ""));
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, { 
        method: httpMethod, 
        headers: finalHeaders, 
        body,
        mode: 'cors',
        credentials: 'include',
        signal: AbortSignal.timeout(30000),
      });

      console.log(`📥 Response (attempt ${attempt}): ${resp.status} ${resp.statusText}`);

      if (resp.status === 0) throw new Error('CORS_ERROR');

      let data;
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          data = await resp.json();
        } catch (jsonError) {
          console.warn("JSON parse error:", jsonError);
          data = { error: "Invalid JSON response" };
        }
      } else {
        data = await resp.text();
      }

      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        console.log("📋 Response data:", data);
      }

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
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt < retries && (
        error.name === 'TypeError' || 
        error.message.includes('CORS') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError')
      )) {
        console.log(`Retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }

      if (error.name === 'TypeError') {
        if (error.message.includes('Failed to fetch') || error.message === 'CORS_ERROR') {
          throw new Error(`無法連接到後端伺服器 (${API_BASE})。可能原因：
1. 伺服器離線或重啟中
2. CORS 設定問題
3. 網路連線問題
請稍後再試或聯繫管理員。`);
        }
        if (error.message.includes('NetworkError')) {
          throw new Error("網路連線失敗，請檢查網路連線或稍後再試");
        }
      }
      throw error;
    }
  }
}

// ====== API ======
export async function apiJoin(pid, nickname) {
  try {
    const result = await request("/api/auth/join", {
      method: "POST",
      body: { pid, nickname },
    });
    if (result?.token) localStorage.setItem("token", result.token);
    if (result?.user) localStorage.setItem("user", JSON.stringify(result.user));
    return result;
  } catch (error) {
    console.error("❌ Join failed:", error.message);
    throw error;
  }
}

export async function apiMe() {
  try {
    return await request("/api/user/profile", { method: "GET" });
  } catch (error) {
    console.error("❌ Get profile failed:", error.message);
    throw error;
  }
}

export async function saveAssessment(data) {
  try {
    console.log("💾 Saving assessment:", data);
    const processedData = {
      ...data,
      submittedAt: data.submittedAt || new Date().toISOString()
    };
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
  console.log("💾 Saving MBTI:", { mbtiString, encodedArray });
  try {
    const mbti_raw = String(mbtiString).toUpperCase();
    const mbti_encoded = Array.isArray(encodedArray) ? encodedArray : [];
    if (mbti_encoded.length !== 4) {
      throw new Error("MBTI encoded array must have exactly 4 elements");
    }
    const result = await request("/api/assessments/upsert", {
      method: "POST",
      body: {
        mbti_raw,
        mbti_encoded,
        submittedAt: new Date().toISOString()
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
    return await request("/api/match/recommend", { method: "POST" });
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
      body: { bot_type: botType },
    });
  } catch (error) {
    console.error("❌ Commit choice failed:", error.message);
    throw error;
  }
}

// ★ 新增：重設機器人選擇 API
export async function resetBotChoice() {
  try {
    console.log("🔄 Resetting bot choice...");
    return await request("/api/user/reset-bot-choice", { method: "POST" });
  } catch (error) {
    console.error("❌ Reset bot choice failed:", error.message);
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

// ★ 修正：添加 sendChatMessage 函數（別名）
export async function sendChatMessage(content, role = "user", botType = null, userMood = null, moodIntensity = null) {
  return await saveChatMessage(content, role, botType, userMood, moodIntensity);
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

export default {
  apiJoin,
  apiMe,
  saveAssessment,
  saveAssessmentMBTI,
  runMatching,
  commitChoice,
  resetBotChoice,
  testConnection,
  saveChatMessage,
  sendChatMessage, // ★ 添加到 default export
  getChatHistory,
  saveMoodRecord,
  getMoodHistory,
  getMyAssessment,
  getMyMatchChoice,
  debugDbTest,
};