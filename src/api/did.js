// src/api/did.js  —— CRA 版（無 import.meta）
// 讀取後端位址：請在 .env(.local) 或 Vercel 設定 REACT_APP_API_BASE
const API_BASE = (process.env.REACT_APP_API_BASE || "").trim();

function buildUrl(path) {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  return `${base}${path}`.replace(/\/{2,}/g, "/").replace(":/", "://");
}

async function jsonRequest(path, { method = "GET", body, headers = {} } = {}) {
  const url = buildUrl(path);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id ?? 0;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-User-Id": String(userId),
      ...headers,
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data?.detail ? JSON.stringify(data.detail) : text || res.statusText;
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  return data;
}

export async function didHealth() {
  return jsonRequest("/api/chat/did/health");
}

export async function createDidTalk({ text, voiceId, sourceUrl, config }) {
  return jsonRequest("/api/chat/did/create_talk", {
    method: "POST",
    body: {
      text,
      voice_id: voiceId,
      source_url: sourceUrl, // 可不傳，由後端 DID_SOURCE_URL 接管
      config,
    },
  });
}

export async function getDidTalk(talkId) {
  return jsonRequest(`/api/chat/did/get_talk/${encodeURIComponent(talkId)}`);
}
