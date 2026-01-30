// Constants - define outside component to avoid re-renders
const HEADER_CONFIG_KEY_NAME =
  import.meta.env.VITE_HEADER_CONFIG_KEY_NAME || "atfali_auth_token";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/";
// Auth storage functions
const AUTH_TOKEN_KEY = "atfali_auth_token";
const USER_DATA_KEY = "user";
const REMEMBERED_EMAIL_KEY = "remembered_email";

export function getHeaderConfig(lang?: string) {
  // Always return default headers structure first
  const headers: Record<string, string> = {
    Accept: "application/json",
    lang: lang || "en", // Default to 'en' if lang is not provided
  };

  // Safely check for token in localStorage
  try {
    const token =
      localStorage.getItem(HEADER_CONFIG_KEY_NAME) ||
      sessionStorage.getItem(HEADER_CONFIG_KEY_NAME);
    if (token) {
      // Try to parse the token if it's JSON stringified
      try {
        const parsedToken = JSON.parse(token);
        headers.Authorization = `Bearer ${parsedToken}`;
      } catch {
        // If parsing fails, use the raw token
        headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error("Error accessing localStorage:", error);
  }

  return { headers };
}

export function getToken(): string | null {
  try {
    return (
      localStorage.getItem(HEADER_CONFIG_KEY_NAME) ||
      sessionStorage.getItem(HEADER_CONFIG_KEY_NAME)
    );
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
}

export function makeFilterString(filterObj: Record<string, any>): string {
  if (!filterObj) return "";

  const params = new URLSearchParams();

  Object.entries(filterObj).forEach(([key, value]) => {
    if (value == null || value === "") return;

    if (Array.isArray(value)) {
      // Handle array values
      value.forEach((item) => {
        if (item != null && item !== "") {
          params.append(key, String(item));
        }
      });
    } else {
      // Handle single values
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

// Store auth info based on remember me preference
export function storeAuthInfo({
  token,
  user,
  rememberMe = false,
}: {
  token: string;
  user: any;
  rememberMe: boolean;
}) {
  const storage = rememberMe ? localStorage : sessionStorage;

  // Store token
  if (token) {
    storage.setItem(AUTH_TOKEN_KEY, token);
  }
  console.log(token);
  console.log(AUTH_TOKEN_KEY);
  console.log(storage);
  // Store user data - ensure it's properly formatted
  if (user) {
    // Make sure user data includes the fields we need
    const userData = {
      ...user,
      // Ensure we have basic fields
      name: user.name || user.username || user.fullName || "User",
      email: user.email || user.emailAddress || "user@example.com",
      avatar:
        user.avatar ||
        user.profilePicture ||
        user.image ||
        "/images/user/admin.png",
    };
    storage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }

  // Clear from opposite storage
  if (rememberMe) {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }

  // Trigger storage event for other tabs
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "user",
    }),
  );
}

// Get auth token (checks both localStorage and sessionStorage)
export function getAuthToken(): string | null {
  // Check localStorage first (remember me)
  const localStorageToken = localStorage.getItem(AUTH_TOKEN_KEY);
  if (localStorageToken) return localStorageToken;

  // Check sessionStorage (session only)
  const sessionStorageToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (sessionStorageToken) return sessionStorageToken;

  return null;
}

// Get user data
export function getUserData(): any | null {
  // Check localStorage first
  const localStorageUser = localStorage.getItem(USER_DATA_KEY);
  if (localStorageUser) {
    try {
      return JSON.parse(localStorageUser);
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }
  }

  // Check sessionStorage
  const sessionStorageUser = sessionStorage.getItem(USER_DATA_KEY);
  if (sessionStorageUser) {
    try {
      return JSON.parse(sessionStorageUser);
    } catch (e) {
      console.error("Error parsing user data from sessionStorage:", e);
    }
  }

  return null;
}

// Clear all auth data
export function clearAuthInfo() {
  // Clear from both storage types
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(REMEMBERED_EMAIL_KEY);

  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Check if remember me was used
export function isRememberMeEnabled(): boolean {
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
}

// Export BASE_URL for use in api.ts
export { BASE_URL };
