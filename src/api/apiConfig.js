const BASE_URL = "http://localhost:8000/api";
const TIMEOUT = 5000;

// ⚙️ Hàm fetch có timeout
const fetchWithTimeout = (url, options = {}, timeout = TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    ),
  ]);
};

// ⚙️ Hàm xử lý chung cho tất cả request
const request = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("token");

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data) config.body = JSON.stringify(data);

  try {
    const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, config);

    // 🔍 Nếu server không trả về JSON hợp lệ
    const text = await response.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { message: text };
    }

    // 🧭 Xử lý lỗi HTTP
    if (!response.ok) {
      if (response.status === 401) {
        console.error("401 Unauthorized: Token hết hạn hoặc không hợp lệ.");
        localStorage.removeItem("token");
        // window.location.href = "/login"; // nếu muốn tự động logout
      } else if (response.status === 403) {
        console.error("403 Forbidden: Không có quyền truy cập.");
      } else if (response.status >= 500) {
        console.error("Lỗi server:", json);
      }
      throw json;
    }

    return json; // ✅ Thành công

  } catch (error) {
    const errorMessage = error?.message || ""; 

    if (errorMessage === "Request timeout") {
      console.error("⏱️ Timeout: Server không phản hồi.");
    } else if (errorMessage.includes("Failed to fetch")) {
      console.error("🌐 Network Error: Không thể kết nối server.");
    } else {
      console.error("❌ Lỗi hệ thống:", error);
    }
    throw error;
  }
};

// 🎯 Các hàm tiện lợi
export const api = {
  get: (endpoint) => request(endpoint, "GET"),
  post: (endpoint, data) => request(endpoint, "POST", data),
  put: (endpoint, data) => request(endpoint, "PUT", data),
  patch: (endpoint, data) => request(endpoint, "PATCH", data),
  delete: (endpoint) => request(endpoint, "DELETE"),
};

export default api;
