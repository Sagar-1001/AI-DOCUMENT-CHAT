import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ai-document-chat-hjww.onrender.com/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const uploadDocument = (formData) =>
  API.post('/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getAllDocuments = () => API.get('/document');
export const deleteDocument = (id) => API.delete(`/document/${id}`);
export const askQuestion = (documentId, question) =>
  API.post(`/chat/${documentId}`, { question });
export const getChatHistory = (documentId) => API.get(`/chat/${documentId}`);