import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANTE: Se estiver a testar no telemóvel (físico ou emulador Android),
// substitua 'localhost' pelo IP da sua máquina (ex: 'http://192.168.1.15:4000')
const API_URL = 'http://10.0.0.167:4000'; 

const api = axios.create({
  baseURL: API_URL,
});

// ===================================================================
// INTERCEPTOR DE AUTENTICAÇÃO
// Garante que o token seja enviado em todas as requisições
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

export default api;

// =====================================================
// 1. FUNÇÕES DE AUTENTICAÇÃO
// =====================================================
export const registerUser = (userData) => api.post('/register', userData);
export const loginUser = (credentials) => api.post('/login', credentials);

// =====================================================
// 2. FUNÇÕES DO DASHBOARD E PASTAS
// =====================================================
export const getDashboardData = () => api.get('/dashboard');
export const createFolder = (name) => api.post('/folders', { name });
export const deleteFolder = (id) => api.delete(`/folders/${id}`);
export const getFolderDetails = (id) => api.get(`/folders/${id}`);
export const getAllFolders = () => api.get('/folders');

// [NOVA FUNÇÃO] Remove múltiplos quizzes de uma pasta (sem apagar os quizzes do sistema)
export const removeQuizzesFromFolder = (folderId, quizIds) => 
  api.post(`/folders/${folderId}/remove_quizzes`, { quizIds });

// [NOVA] Apaga múltiplas pastas de uma vez (Bulk Delete)
export const deleteFoldersBulk = (folderIds) => 
  api.post('/folders/bulk_delete', { folderIds });

// =====================================================
// 3. FUNÇÕES DE CRUD DE QUIZ
// =====================================================
export const getQuizDetails = (id) => api.get(`/quizzes/${id}`);
export const createQuiz = (quizData) => api.post('/quizzes', quizData);
export const updateQuiz = (id, quizData) => api.put(`/quizzes/${id}`, quizData);
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);
