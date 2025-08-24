// src/api/client.js
// 改善：錯誤訊息可讀、MBTI 儲存具多形容錯

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
  console.log("Token exists:", !!token);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatFastAPIError(data, status) {
  if (!data) return `HTTP ${status}`;
  // FastAPI 常見格式：{ detail: [...] } 或 { detail: { ... } }
  try {
    if (Array.isArray(data.detail)) {
      const msg = data.detail
        .map(d => {
          const loc = d.loc ? (Array.isArray(d.loc) ? d.loc.join(".") : String(d.loc)) : "";
          const m = d.msg || d.message || "";
          return loc ? `${loc}: ${m}` : m;
        })
        .join(" | ");
      return `HTTP ${status} - ${msg}`;
    }
    if (data.detail && typeof data.detail === "object") {
      return `HTTP ${status} - ${JSON.stringify(data.detail)}`;
    }
    if (typeof data.detail === "string") return `HTTP ${status} - ${data.detail}`;
    if (data.message) return `HTTP ${status} - ${data.message}`;
    if (data.error) return `HTTP ${status} - ${data.error}`;
    return `HTTP ${status} - ${JSON.stringify(data)}`;
  } catch {
    return `HTTP ${status} - ${JSON.stringify(data)}`;
  }
}

async function request(path, options = {}) {
  const base = API_BASE.replace(/\/+$/, "");
  const url = `${base}${path}`;

  console.log(`Making request to: ${url}`);
  console.log("Request options:", options);

  try {
    const resp = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    console.log(`Response status: ${resp.status}`);

    const ct = resp.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await resp.json() : await resp.text();

    console.log("Response data:", data);

    if (!resp.ok) {
      console.error("Response error detail:", data);
      const err = new Error(formatFastAPIError(data, resp.status));
      err.status = resp.status;
      err.raw = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`Request failed for ${path}:`, error);
    throw error;
  }
}

// === 既有 API ===
export async function apiJoin(pid, nickname) {
  const result = await request("/api/auth/join", {
    method: "POST",
    body: JSON.stringify({ pid, nickname }),
  });
  if (result?.token) localStorage.setItem("token", result.token);
  if (result?.user) localStorage.setItem("user", JSON.stringify(result.user));
  return result;
}

export async function apiMe() {
  return await request("/api/user/profile", {
    method: "GET",
    headers: { ...authHeader() },
  });
}

export async function saveAssessment(partial) {
  console.log("Saving assessment data:", partial);
  const result = await request("/api/assessments/upsert", {
    method: "POST",
    headers: { ...authHeader() },
    body: JSON.stringify(partial),
  });
  console.log("Assessment saved successfully:", result);
  return result;
}

// === 新增：專用的 MBTI 多形容錯儲存 ===
export async function saveAssessmentMBTI(mbti, encoded) {
  const submittedAt = new Date().toISOString();
  const candidates = [
    // 1) 最穩：純字串 + 時戳
    { mbti: String(mbti).toUpperCase(), submittedAt },
    // 2) 物件版
    { mbti: { raw: String(mbti).toUpperCase(), encoded }, submittedAt },
    // 3) 扁平欄位版（若後端 schema 這樣命名）
    { mbti_raw: String(mbti).toUpperCase(), mbti_encoded: encoded, submittedAt },
  ];

  let lastErr = null;
  for (const body of candidates) {
    try {
      console.log("💾 Trying payload:", body);
      return await saveAssessment(body);
    } catch (e) {
      lastErr = e;
      console.warn("Payload failed:", e.message);
    }
  }
  // 全部失敗，把最後一次的詳細錯誤丟回去（內含 e.raw）
  throw lastErr;
}

export async function runMatching() {
  return await request("/api/match/recommend", {
    method: "POST",
    headers: { ...authHeader() },
    body: JSON.stringify({}),
  });
}

export async function commitChoice(botType) {
  return await request("/api/match/choose", {
    method: "POST",
    headers: { ...authHeader() },
    body: JSON.stringify({ botType }),
  });
}

export async function testConnection() {
  return await request("/api/health");
}

export default {
  apiJoin,
  apiMe,
  saveAssessment,
  saveAssessmentMBTI,
  runMatching,
  commitChoice,
  testConnection,
};
