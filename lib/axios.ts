import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/lib/constants";

let getSessionFn: null | (() => Promise<{ accessToken?: string } | null>) = null;
let signOutFn: null | ((options?: { callbackUrl?: string }) => Promise<void>) = null;

async function ensureAuthFunctions() {
  if (typeof window === "undefined") return;
  if (getSessionFn && signOutFn) return;

  const authModule = await import("next-auth/react");

  getSessionFn = authModule.getSession as () => Promise<{ accessToken?: string } | null>;
  signOutFn = authModule.signOut as (options?: { callbackUrl?: string }) => Promise<void>;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      await ensureAuthFunctions();
      const session = getSessionFn ? await getSessionFn() : null;

      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      await ensureAuthFunctions();
      if (signOutFn) {
        await signOutFn({ callbackUrl: "/login" });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
