// src/api/client.js
// 修正 CORS 相關問題的版本

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
    "Content-Type": "application/json",
    ...authHeader(),
    ...headers,
  };

  console.log(`🌐 ${httpMethod} ${url}`);
  if (body) console.log("📤 Request body:", body.substring(0, 200) + (body.length > 200 ? "..." : ""));

  try {
    const resp = await fetch(url, { 
      method: httpMethod, 
      headers: finalHeaders, 
      body,
      mode: 'cors',  // 明確指定 CORS 模式
      credentials: 'omit',  // 不傳送 credentials，因為我們用 Bearer token
    });

    console.log(`📥 Response: ${resp.status} ${resp.statusText}`);

    // 檢查 CORS 相關錯誤
    if (resp.status === 0) {
      throw new Error('CORS 錯誤：無法連接到後端伺服器，請檢查 CORS 設定');
    }

    // 解析回應 - 更安全的方式
    let data;
    const contentType = resp.headers.get("content-type") || "";
    
    try {
      if (contentType.includes("application/json")) {
        const text = await resp.text();
        data = text ? JSON.parse(text) : null;
      } else {
        data = await resp.text();
      }
    } catch (parseError) {
      console.warn("⚠️ Failed to parse response:", parseError);
      data = null;
    }

    if (data && typeof data === 'object') {
      console.log("📋 Response data:", data);
    }

    // 錯誤處理
    if (!resp.ok) {
      const errorMessage = formatError(data, resp.status);
      console.error("❌ Request failed:", errorMessage);
      
      // 特別處理 CORS 相關的錯誤
      if (resp.status === 0 || (resp.status >= 400 && !data)) {
        throw new Error("無法連接到後端伺服器。可能是 CORS 問題或伺服器離線，請聯繫管理員");
      }
      
      const error = new Error(errorMessage);
      error.status = resp.status;
      error.data = data;
      throw error;
    }

    return data;

  } catch (error) {
    // 更詳細的網路錯誤處理
    console.error("🔥 Fetch error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0], // 只顯示第一行 stack trace
    });
    
    if (error.name === 'TypeError') {
      if (error.message.includes('Failed to fetch')) {
        console.error("🌐 CORS/Network error - possible causes:");
        console.error("  1. Backend server is down");
        console.error("  2. CORS not properly configured");
        console.error("  3. Network connectivity issues");
        console.error("  4. SSL/TLS certificate problems");
        
        throw new Error("無法連接到後端伺服器。可能是 CORS 問題或伺服器離線，請聯繫管理員");
      }
      if (error.message.includes('NetworkError')) {
        throw new Error("網路連線失敗，請檢查網路連線或稍後再試");
      }
    }
    
    // 重新拋出其他錯誤
    throw error;
  }
}

// 測試連接函數 - 增強版
export async function testConnection() {
  try {
    console.log("🔍 Testing connection to backend...");
    const result = await request("/api/health");
    console.log("✅ Backend connection successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Backend connection failed:", error.message);
    
    // 提供更詳細的診斷資訊
    console.error("🔧 Troubleshooting tips:");
    console.error("  1. Check if backend server is running");
    console.error("  2. Verify API_BASE URL:", API_BASE);
    console.error("  3. Check browser console for CORS errors");
    console.error("  4. Try accessing health endpoint directly:", `${API_BASE}/api/health`);
    
    throw error;
  }
}

// ====== 核心 API 函數 ======

export async function apiJoin(pid, nickname) {
  try {
    console.log("🔐 Attempting to join with:", { pid, nickname });
    
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
      console.log("✅ User data saved:", result.user);
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
    console.error("📋 Failed data:", data);
    throw error;
  }
}

// 專門用於 MBTI 的儲存函數
export async function saveAssessmentMBTI(mbti, encoded) {
  console.log("💾 Saving MBTI:", { mbti, encoded });
  
  // 驗證輸入
  if (!mbti || !encoded) {
    throw new Error("MBTI 資料不完整");
  }
  
  if (!Array.isArray(encoded) || encoded.length !== 4) {
    throw new Error("MBTI 編碼格式錯誤，應該是長度為 4 的陣列");
  }
  
  try {
    const payload = {
      mbti_raw: String(mbti).toUpperCase(),
      mbti_encoded: encoded,
      submittedAt: new Date().toISOString()
    };
    
    console.log("📤 MBTI payload:", payload);
    
    const result = await request("/api/assessments/upsert", {
      method: "POST",
      body: payload,
    });
    
    console.log("✅ MBTI saved successfully:", result);
    return result;
    
  }