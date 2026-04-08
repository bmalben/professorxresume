const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function getToken() {
  return localStorage.getItem("px_token");
}

export function setToken(t) {
  if (t) localStorage.setItem("px_token", t);
  else localStorage.removeItem("px_token");
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${base}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || res.statusText };
  }
  if (!res.ok) {
    throw new Error(data?.error || res.statusText || "Request failed");
  }
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  patchProfile: (body) => request("/auth/profile", { method: "PATCH", body: JSON.stringify(body) }),
  jobIntel: (body) => request("/ai/job-intel", { method: "POST", body: JSON.stringify(body) }),
  english: (body) => request("/ai/english", { method: "POST", body: JSON.stringify(body) }),
  listInterviews: () => request("/interviews"),
  createInterview: (formData) =>
    request("/interviews", { method: "POST", body: formData }),
  getInterview: (id) => request(`/interviews/${id}`),
  nextQuestion: (id) => request(`/interviews/${id}/next-question`, { method: "POST" }),
  submitAnswer: (id, body) =>
    request(`/interviews/${id}/answer`, { method: "POST", body: JSON.stringify(body) }),
  completeInterview: (id) => request(`/interviews/${id}/complete`, { method: "POST" }),
  dashboardSummary: () => request("/dashboard/summary"),
};
