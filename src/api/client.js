// src/api/client.js
// 強化：1) 強制 JSON.stringify body  2) 無 body 的 POST 也送 {}  3) 友善的422錯誤訊息  4) MBTI 多形容錯

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
  try {
    if (Array.isArray(data.detail)) {
      const msg = data.detail
        .map(d => {
          const loc = d.loc ? (Array.isArray(d.loc) ? d.loc.join(".") : String(d.loc)) : "body";
          const m = d.msg || d.message || "";
          return `${loc}: ${m}`;
        })
        .join(" | ");
      return `HTTP ${status} - ${msg}`;
    }
    if (typeof data.detail === "object" && data.detail) {
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

  let { method = "GET", headers = {}, body } = options;

  // ✅ 強制 JSON：若有 body 且不是字串，轉成 JSON 字串
  // ✅ 若是 POST/PUT/PATCH/DELETE 沒 body，送空物件 {}，避免 FastAPI 收到 null/空字串
  const upper = String(method).toUpperCase();
  if (body == null && !["GET", "HEAD"].includes(upper)) {
    body = "{}";
  } else if (body != null && typeof body !== "string") {
    try {
      body = JSON.stringify(body);
    } catch (e) {
      console.error("JSON.stringify body failed:", e);
      throw e;
    }
  }

  const finalHeaders = {
    Accept: "application/json",
    ...(body != null ? { "Content-Type": "application/json" } : {}),
    ...authHeader(),
    ...headers,
  };

  console.log("Making request to:", url);
  console.log("Request options:", { method: upper, headers: finalHeaders, bodyPreview: typeof body === "string" ? body.slice(0, 200) : null });

  let resp, data, contentType;
  try {
    resp = await fetch(url, { method: upper, headers: finalHeaders, body });
    console.log("Response status:", resp.status);
    contentType = resp.headers.get("content-type") || "";
    data = contentType.includes("application/json") ? await resp.json() : await resp.text();
    console.log("Response data:", data);
  } catch (e) {
    console.error(`Network/Fetch error for ${path}:`, e);
    throw e;
  }

  if (!resp.ok) {
    console.error("Response error detail:", data);
    const err = new Error(formatFastAPIError(data, resp.status));
    err.status = resp.status;
    err.raw = data;
    throw err;
  }

  return data;
}

// ====== 既有 API ======
export async function apiJoin(pid, nickname) {
  const result = await request("/api/auth/join", {
    method: "POST",
    body: { pid, nickname },
  });
  if (result?.token) localStorage.setItem("token", result.token);
  if (result?.user) localStorage.setItem("user", JSON.stringify(result.user));
  return result;
}

export async function apiMe() {
  return await request("/api/user/profile", {
    method: "GET",
  });
}

export async function saveAssessment(partial) {
  console.log("Saving assessment data:", partial);
  const result = await request("/api/assessments/upsert", {
    method: "POST",
    body: partial,
  });
  console.log("Assessment saved successfully:", result);
  return result;
}

// ====== 新增：MBTI 多形容錯儲存 ======
export async function saveAssessmentMBTI(mbti, encoded) {
  const submittedAt = new Date().toISOString();
  const candidates = [
    { mbti: String(mbti).toUpperCase(), submittedAt },
    { mbti: { raw: String(mbti).toUpperCase(), encoded }, submittedAt },
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
  throw lastErr;
}

export async function runMatching() {
  return await request("/api/match/recommend", { method: "POST", body: {} });
}

export async function commitChoice(botType) {
  return await request("/api/match/choose", { method: "POST", body: { botType } });
}

export async function testConnection() {
  return await request("/api/health", { method: "GET" });
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
