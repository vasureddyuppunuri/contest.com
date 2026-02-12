const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const request = async (path, options = {}) => {
  const token = localStorage.getItem("wpa_token");
  const adminPasscode = sessionStorage.getItem("admin_session") === "true" ? "friends129" : null;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (adminPasscode) {
    headers["X-Admin-Passcode"] = adminPasscode;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/api/auth/me"),
  getActiveProject: () => request("/api/projects/active"),
  listProjects: () => request("/api/projects"),
  createProject: (payload) =>
    request("/api/projects", { method: "POST", body: JSON.stringify(payload) }),
  closeProject: (id, payload) =>
    request(`/api/projects/${id}/close`, { method: "POST", body: JSON.stringify(payload) }),
  leaderboard: () => request("/api/leaderboard"),
  profile: () => request("/api/users/me"),
  participants: () => request("/api/users/participants"),
  getStats: () => request("/api/users/stats"),
  voteProject: (id, payload) =>
    request(`/api/projects/${id}/vote`, { method: "POST", body: JSON.stringify(payload) }),
  submitProject: (id, payload) =>
    request(`/api/projects/${id}/submit`, { method: "POST", body: JSON.stringify(payload) }),
  updateProject: (id, payload) =>
    request(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProject: (id) =>
    request(`/api/projects/${id}`, { method: "DELETE" }),
  deleteUser: (id) =>
    request(`/api/users/${id}`, { method: "DELETE" }),
  bulkDeleteUsers: (ids) =>
    request("/api/users/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),
};
