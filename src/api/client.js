// src/api/client.js
// 簡化版本 - 專注解決 CORS 和連線問題

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

  // ★ 重試邏輯
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, { 
        method: httpMethod, 
        headers: finalHeaders, 
        body,
        mode: 'cors',
        credentials: 'include',
      });

      console.log(`📥 Response (attempt ${attempt}): ${resp.status} ${resp.statusText}`);

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
        const text = await resp.text();
        data = text || { error: "Empty response" };
      }

      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        console.log("📋 Response data:", data);
      }

      if (!resp.ok) {
        const errorMessage = formatError(data, resp.status);
        console.error("❌ Request failed:", errorMessage);
        
        // 特定錯誤不重試
        if (resp.status === 401 || resp.status === 403 || resp.status === 422) {
          throw new Error(errorMessage);
        }
        
        // 其他錯誤如果還有重試機會就繼續
        if (attempt < retries) {
          console.log(`Retrying in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        
        throw new Error(errorMessage);
      }

      return data;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      // 網路錯誤重試
      if (attempt < retries && (
        error.name === 'TypeError' || 
        error.message.includes('fetch') ||
        error.message.includes('NetworkError')
      )) {
        console.log(`Retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }

      // 最終失敗
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`無法連接到後端伺服器 (${API_BASE})。可能原因：
1. 伺服器離線或重啟中
2. 網路連線問題
3. CORS 設定問題
請稍後再試或聯繫管理員。`);
      }
      
      throw error;
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
    console.log("✅ MBTI saved:", result);
    return result;
  } catch (error) {
    console.error("❌ MBTI save failed:", error.message);
    throw error;
  }
}

// ====== 配對相關 ======
export async function runMatching() {
  try {
    console.log("🤖 Running matching...");
    return await request("/api/match/recommend", { method: "POST" });
  } catch (error) {
    console.error("❌ Matching failed:", error.message);
    throw error;
  }
}

export async function commitChoice(botType) {
  try {
    console.log("🎯 Committing choice:", botType);
    return await request("/api/match/choose", {
      method: "POST",
      body: { bot_type: botType },
    });
  } catch (error) {
    console.error("❌ Commit choice failed:", error.message);
    throw error;
  }
}

// ====== 聊天相關 ======
export async function sendChatMessage(message, botType, mode = "text", history = []) {
  try {
    console.log("💬 Sending chat:", { message: message.substring(0, 50), botType, mode });
    
    // 取得使用者 ID
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userObj?.id ?? 0;
    
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
    
    console.log("✅ Chat sent:", { ok: result.ok, hasReply: !!result.reply });
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

// ====== 預設匯出 ======
export default {
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
};