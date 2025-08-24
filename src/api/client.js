// src/api/client.js
// 修正後的版本，加強錯誤處理和調試

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "https://emobot-backend.onrender.com"; // 你的後端網域

console.log("API_BASE:", API_BASE); // 調試用

function authHeader() {
  const token = localStorage.getItem("token");
  console.log("Token exists:", !!token); // 調試用
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 增強的 fetch 包裝
async function request(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}${path}`;
  
  console.log(`Making request to: ${url}`); // 調試用
  console.log("Request options:", options); // 調試用
  
  try {
    const resp = await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        ...(options.headers || {}) 
      },
      ...options,
    });

    console.log(`Response status: ${resp.status}`); // 調試用

    // 嘗試解析 JSON；不是 JSON 則以文字處理
    let data;
    const ct = resp.headers.get("content-type") || "";
    
    if (ct.includes("application/json")) {
      data = await resp.json();
    } else {
      data = await resp.text();
    }

    console.log("Response data:", data); // 調試用

    if (!resp.ok) {
      const msg =
        (data && typeof data === "object" && (data.detail || data.error || data.message)) ||
        (typeof data === "string" ? data : `HTTP Error ${resp.status}`);
      throw new Error(msg);
    }
    
    return data;
  } catch (error) {
    console.error(`Request failed for ${path}:`, error);
    throw error;
  }
}

// 加強錯誤處理的 API 函數
export async function apiJoin(pid, nickname) {
  try {
    const result = await request("/api/auth/join", {
      method: "POST",
      body: JSON.stringify({ pid, nickname }),
    });
    
    if (result?.token) {
      localStorage.setItem("token", result.token);
      console.log("Token saved successfully");
    }
    
    if (result?.user) {
      localStorage.setItem("user", JSON.stringify(result.user));
      console.log("User data saved successfully");
    }
    
    return result;
  } catch (error) {
    console.error("Join failed:", error);
    throw error;
  }
}

export async function apiMe() {
  try {
    return await request("/api/user/profile", {
      method: "GET",
      headers: { ...authHeader() },
    });
  } catch (error) {
    console.error("Get profile failed:", error);
    throw error;
  }
}

export async function saveAssessment(partial) {
  try {
    console.log("Saving assessment data:", partial);
    
    const result = await request("/api/assessments/upsert", {
      method: "POST",
      headers: { ...authHeader() },
      body: JSON.stringify(partial),
    });
    
    console.log("Assessment saved successfully:", result);
    return result;
  } catch (error) {
    console.error("Save assessment failed:", error);
    console.error("Assessment data that failed:", partial);
    throw error;
  }
}

export async function runMatching() {
  try {
    return await request("/api/match/recommend", {
      method: "POST",
      headers: { ...authHeader() },
      body: JSON.stringify({}),
    });
  } catch (error) {
    console.error("Run matching failed:", error);
    throw error;
  }
}

export async function commitChoice(botType) {
  try {
    return await request("/api/match/choose", {
      method: "POST",
      headers: { ...authHeader() },
      body: JSON.stringify({ botType: botType }),
    });
  } catch (error) {
    console.error("Commit choice failed:", error);
    throw error;
  }
}

// 新增：測試後端連線的函數
export async function testConnection() {
  try {
    const result = await request("/api/health");
    console.log("Backend connection test successful:", result);
    return result;
  } catch (error) {
    console.error("Backend connection test failed:", error);
    throw error;
  }
}

export default {
  apiJoin,
  apiMe,
  saveAssessment,
  runMatching,
  commitChoice,
  testConnection,
};