// src/api/client.js
// ✅ 讀取雲端環境變數（Vite 或 CRA），沒有就用本機預設
//    部署到 Vercel 時，請在「Project → Settings → Environment Variables」
//    新增：VITE_API_BASE = https://<你的 Render 後端網域>
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "https://emobot-backend.onrender.com"; // 本機開發預設

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 統一的 fetch 包裝：處理 JSON / text、錯誤訊息
async function request(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}${path}`;
  const resp = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    // 你是用 Bearer Token（localStorage），不是 Cookie，所以 credentials 省略
    ...options,
  });

  // 嘗試解析 JSON；不是 JSON 則以文字處理
  let data;
  const ct = resp.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await resp.json();
  } else {
    data = await resp.text();
  }

  if (!resp.ok) {
    const msg =
      (data && typeof data === "object" && (data.detail || data.error)) ||
      (typeof data === "string" ? data : "Request failed");
    throw new Error(msg);
  }
  return data;
}

// ====== 封裝 API ======

export async function apiJoin(pid, nickname) {
  return request("/api/auth/join", {
    method: "POST",
    body: JSON.stringify({ pid, nickname }),
  }).then((res) => {
    if (res?.token) localStorage.setItem("token", res.token);
    return res;
  });
}

export async function apiMe() {
  return request("/api/user/profile", {
    method: "GET",
    headers: { ...authHeader() },
  });
}

export async function saveAssessment(partial) {
  return request("/api/assessments/upsert", {
    method: "POST",
    headers: { ...authHeader() },
    body: JSON.stringify(partial),
  });
}

export async function runMatching() {
  return request("/api/match/recommend", {
    method: "POST",
    headers: { ...authHeader() },
    body: JSON.stringify({}),
  });
}

export async function commitChoice(botType) {
  return request("/api/match/choose", {
    method: "POST",
    headers: { ...authHeader() },
    body: JSON.stringify({ botType: botType }),
  });
}

export default {
  apiJoin,
  apiMe,
  saveAssessment,
  runMatching,
  commitChoice,
};