// src/axiosInstance.js

import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from './config/serverApiConfig';
import { message as AntMessage } from 'antd';

// Create an Axios instance with the base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // No need to set 'Content-Type' here; it will be set dynamically
});

// Add a request interceptor to include the token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem(ACCESS_TOKEN_NAME);
    if (token) {
      // Remove any surrounding quotes (if stored incorrectly)
      token = token.replace(/^"|"$/g, '');
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    AntMessage.error('Failed to send request.');
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle responses globally
axiosInstance.interceptors.response.use(
  (response) => response, // If the response is successful, simply return it
  (error) => {
    // Handle specific status codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          AntMessage.error(data.message || 'Bad Request.');
          break;
        case 401:
          AntMessage.error('Unauthorized. Please log in again.');
          // Optionally, redirect to login page
          // window.location.href = '/login';
          break;
        case 403:
          AntMessage.error('Forbidden. You do not have permission to perform this action.');
          break;
        case 404:
          AntMessage.error('Resource not found.');
          break;
        case 500:
          AntMessage.error('Internal Server Error. Please try again later.');
          break;
        default:
          AntMessage.error(data.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      AntMessage.error('No response from server. Please check your network.');
    } else {
      // Something happened in setting up the request that triggered an Error
      AntMessage.error(`Error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
