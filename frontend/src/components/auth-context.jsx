"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AuthContext = createContext(null);

// Refresh token 5 minutes before expiry
const REFRESH_BUFFER_SECONDS = 5 * 60;
// Check token every minute
const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Decode JWT token without verification (for reading expiry)
 */
function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is about to expire
 */
function isTokenExpiringSoon(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.expiresAt) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.expiresAt - now;

  return timeUntilExpiry > 0 && timeUntilExpiry <= REFRESH_BUFFER_SECONDS;
}

/**
 * Check if token is expired
 */
function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.expiresAt) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return decoded.expiresAt <= now;
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const refreshingRef = useRef(false);
  const intervalRef = useRef(null);

  /**
   * Refresh the token
   */
  const refreshToken = useCallback(async () => {
    if (refreshingRef.current) return;

    const token = Cookies.get("chat-token");
    if (!token) return;

    refreshingRef.current = true;

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/user/refresh-token",
        { token },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.status === "success") {
        // Update token in cookies
        Cookies.set("chat-token", response.data.token, {
          expires: 7,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        console.log("Token refreshed successfully");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);

      // If refresh fails, check if token is actually expired
      if (isTokenExpired(token)) {
        toast.error("Session expired. Please login again.");
        Cookies.remove("chat-token");
        router.push("/");
      }
    } finally {
      refreshingRef.current = false;
    }
  }, [router]);

  /**
   * Check token and refresh if needed
   */
  const checkAndRefreshToken = useCallback(() => {
    const token = Cookies.get("chat-token");

    if (!token) return;

    // If token is expired, redirect to login
    if (isTokenExpired(token)) {
      toast.error("Session expired. Please login again.");
      Cookies.remove("chat-token");
      router.push("/");
      return;
    }

    // If token is expiring soon, refresh it
    if (isTokenExpiringSoon(token)) {
      console.log("Token expiring soon, refreshing...");
      refreshToken();
    }
  }, [refreshToken, router]);

  // Set up interval to check token
  useEffect(() => {
    // Initial check
    checkAndRefreshToken();

    // Set up periodic check
    intervalRef.current = setInterval(checkAndRefreshToken, CHECK_INTERVAL_MS);

    // Check on window focus (in case user was away)
    const handleFocus = () => {
      checkAndRefreshToken();
    };
    window.addEventListener("focus", handleFocus);

    // Check before page unload to potentially refresh
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshToken();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAndRefreshToken]);

  // Intercept axios requests to handle 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const token = Cookies.get("chat-token");

          if (token && !isTokenExpired(token)) {
            // Token should be valid, might be a different issue
            return Promise.reject(error);
          }

          // Try to refresh token
          try {
            await refreshToken();
            // Retry the original request
            const config = error.config;
            config.headers.Authorization =
              "Bearer " + Cookies.get("chat-token");
            return axios(config);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            Cookies.remove("chat-token");
            router.push("/");
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, router]);

  return (
    <AuthContext.Provider value={{ refreshToken, checkAndRefreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
