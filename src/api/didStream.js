// src/api/didStream.js
const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/,"");

async function j(path, opt={}) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    method: opt.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opt.body ? JSON.stringify(opt.body) : undefined,
  });
  const txt = await res.text();
  let data = {};
  try { data = txt ? JSON.parse(txt) : {}; } catch { data = { raw: txt }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

export async function createStream() {
  return j(`/api/chat/did/agents/streams`, { method: "POST", body: { fluent: true, compatibility_mode: "on" }});
}
export async function sendSDP(streamId, answer, sessionId) {
  return j(`/api/chat/did/agents/streams/${encodeURIComponent(streamId)}/sdp`, { method: "POST", body: { answer, session_id: sessionId }});
}
export async function sendICE(streamId, candidate, sessionId) {
  return j(`/api/chat/did/agents/streams/${encodeURIComponent(streamId)}/ice`, { method: "POST", body: {
    candidate: candidate || null,
    sdpMid: candidate?.sdpMid ?? null,
    sdpMLineIndex: candidate?.sdpMLineIndex ?? null,
    session_id: sessionId
  }});
}
export async function speak(streamId, sessionId, text) {
  return j(`/api/chat/did/agents/streams/${encodeURIComponent(streamId)}/speak`, { method: "POST", body: { stream_id: streamId, session_id: sessionId, text }});
}
export async function closeStream(streamId, sessionId) {
  return j(`/api/chat/did/agents/streams/${encodeURIComponent(streamId)}`, { method: "DELETE", body: { session_id: sessionId }});
}
