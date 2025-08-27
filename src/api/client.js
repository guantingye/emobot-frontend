// src/api/client.js
// 🔧 改進版本 - 強化 CORS 處理和錯誤處理

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

  // 🔧 改進 headers 設定
  const finalHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...authHeader(),
    ...headers,
  };

  // 🔧 移除可能導致 CORS 問題的非必要 headers
  delete finalHeaders["X-Requested-With"];

  console.log(`🌐 ${httpMethod} ${url}`);
  if (body) console.log("📤 Request body:", body.substring(0, 200) + (body.length > 200 ? "..." : ""));

  try {
    const resp = await fetch(url, { 
      method: httpMethod, 
      headers: finalHeaders, 
      body,
      // 🔧 改進 fetch 配置
      mode: 'cors',
      cache: 'no-cache',  // 避免快取問題
      redirect: 'follow', // 跟隨重定向
    });

    console.log(`📥 Response: ${resp.status} ${resp.statusText}`);

    // 🔧 改進 CORS 錯誤檢測
    if (resp.status === 0 || (resp.type === 'opaque' && resp.status === 0)) {
      throw new Error('CORS 錯誤：無法連接到後端伺服器，請檢查 CORS 設定');
    }

    // 🔧 處理 OPTIONS 請求的回應
    if (httpMethod === 'OPTIONS') {
      return { ok: true };
    }

    // 解析回應
    let data;
    const contentType = resp.headers.get("content-type") || "";
    
    try {
      if (contentType.includes("application/json")) {
        data = await resp.json();
      } else {
        const textData = await resp.text();
        // 嘗試解析為 JSON，如果失敗就保持原樣
        try {
          data = JSON.parse(textData);
        } catch {
          data = textData;
        }
      }
    } catch (parseError) {
      console.warn("🔍 Response parse error:", parseError);
      data = null;
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
      error.raw = data; // 🔧 保留原始資料供除錯
      throw error;
    }

    return data;

  } catch (error) {
    console.error("🚨 Request error details:", {
      name: error.name,
      message: error.message,
      url,
      method: httpMethod,
      headers: finalHeaders
    });

    // 🔧 改進網路錯誤處理
    if (error.name === 'TypeError') {
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        console.error("🌐 CORS/Network error:", error.message);
        throw new Error("無法連接到後端伺服器。這可能是由於：\n1. CORS 設定問題\n2. 伺服器暫時離線\n3. 網路連線問題\n\n請稍後再試或聯繫管理員");
      }
      if (error.message.includes('NetworkError')) {
        console.error("🌐 Network error:", error.message);
        throw new Error("網路連線失敗，請檢查網路連線或稍後再試");
      }
    }

    // 🔧 處理伺服器錯誤
    if (error.status >= 500) {
      throw new Error(`伺服器內部錯誤 (${error.status})，請稍後再試`);
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
    // 🔧 提供更詳細的錯誤資訊給使用者
    if (error.raw) {
      console.error("❌ Raw error data:", error.raw);
    }
    throw error;
  }
}

// 🔧 改進 MBTI 儲存函數
export async function saveAssessmentMBTI(mbti, encoded) {
  console.log("💾 Saving MBTI:", { mbti, encoded });
  
  // 🔧 加強資料驗證
  if (!mbti || !encoded) {
    throw new Error("MBTI 資料不完整");
  }
  
  if (!Array.isArray(encoded) || encoded.length !== 4) {
    throw new Error("MBTI 編碼格式不正確，應為 4 位元的陣列");
  }
  
  try {
    const result = await request("/api/assessments/upsert", {
      method: "POST",
      body: {
        mbti_raw: String(mbti).toUpperCase().trim(),
        mbti_encoded: encoded,
        submittedAt: new Date().toISOString()
      },
    });
    
    console.log("✅ MBTI saved successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ MBTI save failed:", error.message);
    
    // 🔧 提供更具體的錯誤訊息
    if (error.status === 422) {
      throw new Error("資料格式錯誤，請檢查填寫內容");
    } else if (error.status === 401) {
      throw new Error("登入已過期，請重新登入");
    } else if (error.status >= 500) {
      throw new Error("伺服器暫時無法處理請求，請稍後再試");
    }
    
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

// 🔧 改進測試連線函數
export async function testConnection() {
  try {
    console.log("🔍 Testing connection to:", API_BASE);
    const result = await request("/api/health");
    console.log("✅ Connection test successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    throw new Error(`連線測試失敗：${error.message}`);
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

// 🔧 新增：連線測試和除錯工具
export async function debugCorsTest() {
  try {
    console.log("🔍 Testing CORS with simple GET request...");
    const result = await request("/api/health", { method: "GET" });
    
    console.log("🔍 Testing CORS with POST request...");
    const postResult = await request("/api/health", { 
      method: "POST",
      body: { test: true }
    });
    
    return { get: result, post: postResult };
  } catch (error) {
    console.error("❌ CORS test failed:", error.message);
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
  debugCorsTest,
};