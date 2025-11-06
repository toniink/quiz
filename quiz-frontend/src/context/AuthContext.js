// src/context/AuthContext.js
import React, { useState, createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Importe o 'api' e o 'loginUser' diretamente do api.js
import api, { loginUser } from '../services/api'; 

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (Provider)
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Para a tela de loading

  // Verifica se há um token salvo ao iniciar o app
  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          setToken(savedToken);
          // IMPORTANTE: Define o token no Axios assim que o app carregar
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
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
    const response = await loginUser({ email, password }); // Chama a API
    const newToken = response.data.token;
    
    setToken(newToken);
    await AsyncStorage.setItem('userToken', newToken);
    
    // IMPORTANTE: Define o token no Axios no momento do login
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

// 3. Cria o Hook customizado (para ser fácil de usar)
export const useAuth = () => {
  return useContext(AuthContext);
};