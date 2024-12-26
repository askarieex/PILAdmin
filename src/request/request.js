// frontend/src/request/request.js

import axios from "axios";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "@/config/serverApiConfig";
import { token as tokenCookies } from "@/auth";
import errorHandler from "./errorHandler";
import successHandler from "./successHandler";

// Create an Axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to include the token in headers for every request
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = tokenCookies.get();
    if (authToken) {
      config.headers[ACCESS_TOKEN_NAME] = authToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const request = {
  /**
   * POST request to a specific entity URL with JSON data
   * Useful for actions like login and logout
   * @param {string} entityUrl - The endpoint URL (e.g., 'login' or 'logout')
   * @param {object} jsonData - The data to be sent in the request body
   * @returns {object} - The response handled by successHandler or errorHandler
   */
  post: async (entityUrl, jsonData) => {
    try {
      const response = await axiosInstance.post(entityUrl, jsonData);
      return successHandler(response);
    } catch (error) {
      return errorHandler(error);
    }
  },
};

export default request;
