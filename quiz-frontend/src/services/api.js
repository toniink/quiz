// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// !! Lembre-se de trocar localhost pelo IP da sua máquina se usar o celular
const API_URL = 'http://localhost:4000'; 

const api = axios.create({
  baseURL: API_URL,
});

// ===================================================================
// INTERCEPTOR DE AUTENTICAÇÃO (A PARTE QUE FALTAVA)
// Isso é executado ANTES de CADA requisição
// ===================================================================
api.interceptors.request.use(
  async (config) => {
    // 1. Pega o token salvo no AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    
    // 2. Se o token existir, adiciona no cabeçalho (Header)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Continua com a requisição modificada
  },
  (error) => {
    // Trata erros da requisição
    return Promise.reject(error);
  }
);
// ===================================================================

export default api;

// Funções de Autenticação
export const registerUser = (userData) => api.post('/register', userData);
export const loginUser = (credentials) => api.post('/login', credentials);

// Funções do Dashboard
export const getDashboardData = () => api.get('/dashboard');
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);

// Funções de CRUD de Quiz
export const getQuizDetails = (id) => api.get(`/quizzes/${id}`);
export const createQuiz = (quizData) => api.post('/quizzes', quizData); // Esta é a que estava dando 404
export const updateQuiz = (id, quizData) => api.put(`/quizzes/${id}`, quizData);

//funcoes de pastas
export const createFolder = (name) => api.post('/folders', { name });
export const getFolderDetails = (id) => api.get(`/folders/${id}`);
export const deleteFolder = (id) => api.delete(`/folders/${id}`);
export const getAllFolders = () => api.get('/folders');

