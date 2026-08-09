const API_BASE_URL = "http://localhost:8000"; 

const getHeaders = () => {
  const token = localStorage.getItem("access_token") || "";
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const adminService = {
  // 1. Dashboard
  async getDashboard() {
    const res = await fetch(`${API_BASE_URL}/dashboard`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    return res.json();
  },

  // 2. Users
  async getUsers(page = 1, limit = 20, search = "") {
    const query = new URLSearchParams({ page, limit, ...(search && { search }) });
    const res = await fetch(`${API_BASE_URL}/users?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  async toggleUserStatus(userId) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to toggle user status");
    return res.json();
  },

  // 3. Queues
  async getQueues(page = 1, limit = 20, search = "") {
    const query = new URLSearchParams({ page, limit, ...(search && { search }) });
    const res = await fetch(`${API_BASE_URL}/queues?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch queues");
    return res.json();
  },

  async toggleQueueStatus(queueId) {
    const res = await fetch(`${API_BASE_URL}/queues/${queueId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to toggle queue status");
    return res.json();
  },

  // 4. Tokens
  async getTokens(page = 1, limit = 20, status = "") {
    const query = new URLSearchParams({ page, limit, ...(status && { status }) });
    const res = await fetch(`${API_BASE_URL}/tokens?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch tokens");
    return res.json();
  },

  async cancelToken(tokenId) {
    const res = await fetch(`${API_BASE_URL}/tokens/${tokenId}/cancel`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to cancel token");
    return res.json();
  },

  // 5. Institutions / Organizations
  async getInstitutions(page = 1, limit = 20, search = "") {
    const query = new URLSearchParams({ page, limit, ...(search && { search }) });
    const res = await fetch(`${API_BASE_URL}/institutions?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch institutions");
    return res.json();
  },

  async getInstitutionDetail(institutionId) {
    const res = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch institution details");
    return res.json();
  },

  // 6. Audit Logs
  async getLogs(page = 1, limit = 20) {
    const query = new URLSearchParams({ page, limit });
    const res = await fetch(`${API_BASE_URL}/logs?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
  },
};