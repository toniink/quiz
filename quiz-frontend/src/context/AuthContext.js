// src/context/AuthContext.js
import React, { useState, createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { loginUser } from '../services/api'; // Importe o 'api' e 'loginUser'

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (Provider)
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se há um token salvo ao iniciar o app
  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        setToken(savedToken);
      } catch (e) {
        console.error("Falha ao carregar token", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  // Função de Login
  const login = async (email, password) => {
    // A lógica de login agora vive aqui
    const response = await loginUser({ email, password });
    const newToken = response.data.token;
    setToken(newToken);
    await AsyncStorage.setItem('userToken', newToken);
    
    // Atualiza o header padrão do Axios após o login
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    return response.data; // Retorna os dados do usuário se necessário
  };

  // Função de Logout
  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem('userToken');
    // Remove o header do Axios
    delete api.defaults.headers.common['Authorization'];
  };

  const authContextValue = {
    token,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Cria o Hook customizado
export const useAuth = () => {
  return useContext(AuthContext);
};