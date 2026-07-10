import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ── Clerk token injection ───────────────────────────────────────────
// Hooks set this once Clerk's context is available so every request
// includes the session token in the Authorization header.
let _getToken: (() => Promise<string | null>) | null = null;

export function setClerkTokenProvider(provider: () => Promise<string | null>) {
  console.log("🔑 Clerk token provider registered");
  _getToken = provider;
}

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      console.log("🔑 Fetching Clerk token...");
      const token = await _getToken();
      if (token) {
        console.log(`🔑 Token obtained: ${token.substring(0, 30)}...`);
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("🔑 Clerk token is null (not signed in?)");
      }
    } catch (err) {
      console.error("🔑 Clerk token error:", err);
    }
  } else {
    console.warn("🔑 No Clerk token provider registered yet");
  }
  return config;
});

export default api;
