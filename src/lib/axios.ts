import axios from "axios";

/**
 * Interface for server response structure
 */
interface ServerResponse {
  message: string;
  success: boolean;
  [key: string]: unknown;
}

/**
 * Interface for our standardized API response
 */
interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3107/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or Redux store
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const originalAxiosData = response.data as unknown; // Đây là dữ liệu gốc từ server (từ response.data của Axios)

    // Kiểm tra nếu dữ liệu gốc là một đối tượng và có các trường 'message' và 'success'
    // Đây là giả định rằng backend của bạn luôn trả về những trường này ở cấp độ gốc.
    if (
      typeof originalAxiosData === "object" &&
      originalAxiosData !== null &&
      "message" in originalAxiosData &&
      typeof (originalAxiosData as ServerResponse).message === "string" &&
      "success" in originalAxiosData &&
      typeof (originalAxiosData as ServerResponse).success === "boolean"
    ) {
      const serverData = originalAxiosData as ServerResponse;

      // Logic để tạo payload cho trường 'data'
      let dataPayload: unknown; // Use unknown instead of any for type safety

      // Nếu server đã trả về một trường 'data' rồi (Kịch bản B), sử dụng nó
      if ("data" in serverData) {
        dataPayload = serverData.data;
      } else {
        // Nếu không có trường 'data' (Kịch bản A), gom tất cả các trường còn lại
        // trừ 'message' và 'success' vào làm payload data
        const tempPayload: Record<string, unknown> = {};
        for (const key in serverData) {
          if (key !== "message" && key !== "success") {
            tempPayload[key] = serverData[key];
          }
        }
        dataPayload = tempPayload;
      }

      // Ghi đè response.data của Axios bằng cấu trúc ApiResponse<T> của bạn
      // Axios response object also has other properties like status, headers, config, etc.
      // We only modify the 'data' property of the Axios response.
      const apiResponse: ApiResponse = {
        data: dataPayload,
        message: serverData.message,
        success: serverData.success,
      };

      response.data = apiResponse;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
