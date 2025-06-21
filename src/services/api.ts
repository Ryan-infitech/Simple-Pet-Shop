// Config untuk API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// Helper untuk menambahkan token otentikasi jika tersedia
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return token
    ? { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` }
    : DEFAULT_HEADERS;
};

// Basic fetch wrapper dengan error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    };

    console.log("📡 API Request:", {
      url,
      method: options.method || "GET",
      headers: headers,
      body: options.body,
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    console.log("📡 API Response:", {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      data: data,
    });

    if (!response.ok) {
      console.error("❌ API Error Response:", data);
      throw new Error(
        data.message || data.error || "Terjadi kesalahan pada API"
      );
    }

    return data as T;
  } catch (error) {
    console.error("❌ API Error:", error);
    throw error;
  }
}

// Helper methods untuk HTTP requests
const api = {
  get: <T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ) => {
    let urlWithParams = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        urlWithParams += `?${queryString}`;
      }
    }

    return fetchApi<T>(urlWithParams, {
      method: "GET",
    });
  },

  post: <T>(endpoint: string, data: any) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: any) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, {
      method: "DELETE",
    }),
  upload: <T>(endpoint: string, formData: FormData) => {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetchApi<T>(endpoint, {
      method: "POST",
      headers,
      body: formData,
    });
  },
};

export default api;
