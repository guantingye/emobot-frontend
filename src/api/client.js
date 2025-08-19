const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiJoin(pid, nickname) {
  const r = await fetch(`${API_BASE}/api/auth/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pid, nickname })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail || data.error || "join failed");
  return data;
}

export async function saveAssessment(partial) {
  const r = await fetch(`${API_BASE}/api/assessments/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(partial)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail || data.error || "save failed");
  return data;
}
